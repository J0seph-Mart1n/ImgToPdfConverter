package main

import (
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/chromedp/cdproto/page"
	"github.com/chromedp/chromedp"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/tmc/langchaingo/llms"
	"github.com/tmc/langchaingo/llms/openai"
)

// systemPrompt provides detailed instructions to the AI agent for converting
// images into faithful HTML reproductions.
const systemPrompt = `You are an expert image-to-HTML converter agent.
Your task is to analyze the provided image and generate a SINGLE, self-contained HTML file
that faithfully reproduces everything visible in the image.

Follow these rules strictly:

1. **Text Extraction**: Extract ALL text from the image exactly as it appears — every heading,
   paragraph, label, caption, watermark, button text, or any other visible text. Preserve the
   original wording, capitalisation, and punctuation.

2. **Layout & Structure**: Reproduce the spatial layout of the image using modern HTML5 and CSS.
   Use flexbox or CSS grid where appropriate. If the image shows a multi-column layout, cards,
   a navigation bar, a footer, or any other structural element, replicate that structure
   precisely in HTML.

3. **Styling & Design**: Match the visual design as closely as possible:
   - Use the exact (or closest possible) colours for backgrounds, text, borders, and accents.
   - Match font sizes, weights, and styles (bold, italic, etc.).
   - Reproduce rounded corners, shadows, gradients, and spacing.
   - If the image uses a dark or light theme, replicate that theme.

4. **Images & Icons**: If the image contains photographs, illustrations, icons, or logos,
   do NOT use <img> tags or external placeholder URLs under any circumstances, as they cause rendering hangs.
   Instead, replicate them using purely CSS styling (e.g., background colours/shapes), inline SVG code, or Unicode symbols.

5. **Responsiveness**: Make the HTML reasonably responsive so it looks good at different
   viewport widths, but prioritise accuracy over responsiveness.

6. **Output Format**: Return ONLY the raw HTML code starting with <!DOCTYPE html> and ending
   with </html>. Do NOT wrap the output in markdown code fences. Do NOT include any
   explanatory text before or after the HTML.`

func main() {
	// Load environment variables from .env file (optional fallback key)
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, falling back to system environment variables")
	}

	// The .env API_KEY is used as a fallback if the user doesn't provide one via header
	fallbackKey := strings.TrimSpace(os.Getenv("API_KEY"))
	if fallbackKey == "" {
		log.Println("Note: No API_KEY in .env — users must provide their key via the X-API-Key header")
	}

	// Set up Gin router
	router := gin.Default()

	// Configure CORS to allow the Next.js frontend
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"POST", "GET", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "X-API-Key"},
		AllowCredentials: true,
	}))

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Main conversion endpoint
	router.POST("/convert", func(c *gin.Context) {
		handleConvert(c, fallbackKey)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on :%s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// handleConvert processes an uploaded image file and returns AI-generated HTML.
func handleConvert(c *gin.Context, fallbackKey string) {
	// Resolve the API key: prefer the user-provided header, fall back to .env
	apiKey := strings.TrimSpace(c.GetHeader("X-API-Key"))
	if apiKey == "" {
		apiKey = fallbackKey
	}
	if apiKey == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "No API key provided. Send your Groq API key in the X-API-Key header.",
		})
		return
	}

	// Create a per-request LLM client with the user's API key
	llm, err := openai.New(
		openai.WithToken(apiKey),
		openai.WithBaseURL("https://api.groq.com/openai/v1"),
		openai.WithModel("qwen/qwen3.8-27b"),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("Failed to initialise AI client: %v", err),
		})
		return
	}

	// Accept a multipart form file upload with field name "image"
	file, header, err := c.Request.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "No image file provided. Use form field 'image'.",
		})
		return
	}
	defer file.Close()

	// Validate content type
	contentType := header.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, "image/") {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("Invalid file type: %s. Please upload an image.", contentType),
		})
		return
	}

	// Read the image bytes
	imageBytes, err := io.ReadAll(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to read uploaded image.",
		})
		return
	}

	// Encode image to base64 data URI
	b64 := base64.StdEncoding.EncodeToString(imageBytes)
	dataURI := fmt.Sprintf("data:%s;base64,%s", contentType, b64)

	log.Printf("Processing image: %s (%d bytes, %s)", header.Filename, len(imageBytes), contentType)

	// Build the multimodal message for the LLM
	messages := []llms.MessageContent{
		{
			Role:  llms.ChatMessageTypeSystem,
			Parts: []llms.ContentPart{llms.TextPart(systemPrompt)},
		},
		{
			Role: llms.ChatMessageTypeHuman,
			Parts: []llms.ContentPart{
				llms.TextPart("Analyse this image and generate a complete, self-contained HTML file that reproduces it as faithfully as possible. Capture every piece of text, all styling, colours, layout, and design elements."),
				llms.ImageURLPart(dataURI),
			},
		},
	}

	// Call the Groq-hosted model via LangChain
	ctx := context.Background()
	resp, err := llm.GenerateContent(ctx, messages,
		llms.WithMaxTokens(4000),
		llms.WithTemperature(0.1),
	)
	if err != nil {
		log.Printf("LLM error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("AI processing failed: %v", err),
		})
		return
	}

	// Extract the generated HTML from the response
	if len(resp.Choices) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "AI returned an empty response.",
		})
		return
	}

	htmlContent := resp.Choices[0].Content

	// Strip markdown code fences if the model wrapped the output
	htmlContent = strings.TrimSpace(htmlContent)
	htmlContent = strings.TrimPrefix(htmlContent, "```html")
	htmlContent = strings.TrimPrefix(htmlContent, "```")
	htmlContent = strings.TrimSuffix(htmlContent, "```")
	htmlContent = strings.TrimSpace(htmlContent)

	log.Printf("Successfully generated HTML (%d bytes) for %s", len(htmlContent), header.Filename)
	log.Printf("HTML content: %s", htmlContent)

	// Convert the generated HTML to PDF using headless Chrome
	pdfBytes, err := convertHTMLToPDF(htmlContent)
	if err != nil {
		log.Printf("PDF conversion error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("Failed to generate PDF: %v", err),
		})
		return
	}

	log.Printf("Successfully generated PDF (%d bytes) for %s", len(pdfBytes), header.Filename)
	pdfBase64 := base64.StdEncoding.EncodeToString(pdfBytes)

	c.JSON(http.StatusOK, gin.H{
		"html":      htmlContent,
		"pdfBase64": pdfBase64,
		"filename":  header.Filename,
	})
}

// convertHTMLToPDF uses chromedp (headless Chrome) to render HTML to a PDF buffer.
func convertHTMLToPDF(html string) ([]byte, error) {
	// Create headless chrome context
	ctx, cancel := chromedp.NewContext(context.Background())
	defer cancel()

	// Add a timeout to prevent hanging
	ctx, cancel = context.WithTimeout(ctx, 60*time.Second)
	defer cancel()

	// Encode HTML to data URI to bypass file:// security
	htmlBase64 := base64.StdEncoding.EncodeToString([]byte(html))
	dataURI := "data:text/html;base64," + htmlBase64

	var pdfBuffer []byte
	err := chromedp.Run(ctx,
		// Navigate blocks until the load event fires, ensuring scripts like Tailwind CDN complete
		chromedp.Navigate(dataURI),
		// Brief sleep to allow any final JavaScript compilation (e.g. Tailwind classes rendering)
		chromedp.Sleep(1*time.Second),
		chromedp.ActionFunc(func(ctx context.Context) error {
			buf, _, err := page.PrintToPDF().
				WithPrintBackground(true).
				WithPreferCSSPageSize(true).
				Do(ctx)
			if err != nil {
				return err
			}
			pdfBuffer = buf
			return nil
		}),
	)
	if err != nil {
		return nil, err
	}

	return pdfBuffer, nil
}
