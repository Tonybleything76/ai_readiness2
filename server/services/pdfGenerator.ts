import puppeteer from 'puppeteer';
import { Response } from '@shared/schema';
import { format } from 'date-fns';

export interface PDFGenerationOptions {
  logoUrl?: string;
  organizationName?: string;
  customBranding?: {
    primaryColor?: string;
    secondaryColor?: string;
    companyName?: string;
  };
}

export class PDFGenerator {
  /**
   * Generate a branded PDF report for an assessment response
   */
  static async generateAssessmentReport(
    response: Response,
    options: PDFGenerationOptions = {}
  ): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });

    try {
      const page = await browser.newPage();
      
      // Generate HTML content for the PDF
      const htmlContent = this.generateReportHTML(response, options);
      
      // Set the HTML content
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0'
      });

      // Generate PDF with specific options
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        },
        preferCSSPageSize: true,
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  /**
   * Generate the HTML content for the assessment report
   */
  private static generateReportHTML(
    response: Response,
    options: PDFGenerationOptions
  ): string {
    const pillarScores = response.pillarScores as Record<string, number>;
    const answers = response.answersJson as Record<string, number>;
    
    // Extract pillar names from the scores
    const pillars = Object.keys(pillarScores);
    
    // Generate radar chart data points
    const radarData = pillars.map((pillar, index) => {
      const angle = (index * 360) / pillars.length;
      const score = pillarScores[pillar];
      const radius = (score / 100) * 80; // Scale to chart radius
      const x = 100 + radius * Math.cos((angle - 90) * Math.PI / 180);
      const y = 100 + radius * Math.sin((angle - 90) * Math.PI / 180);
      return { x, y, score, pillar };
    });

    // Generate gauge chart (simplified SVG representation)
    const gaugeAngle = (response.overall / 100) * 180; // Half circle
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AI Readiness Assessment Report</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: white;
        }
        
        .header {
          background: linear-gradient(135deg, ${options.customBranding?.primaryColor || '#3b82f6'}, ${options.customBranding?.secondaryColor || '#1e40af'});
          color: white;
          padding: 30px;
          text-align: center;
          margin-bottom: 30px;
        }
        
        .logo {
          width: 60px;
          height: 60px;
          margin: 0 auto 15px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
        }
        
        .header h1 {
          font-size: 28px;
          margin-bottom: 10px;
        }
        
        .header p {
          font-size: 16px;
          opacity: 0.9;
        }
        
        .content {
          padding: 0 30px;
          max-width: 100%;
        }
        
        .summary-section {
          background: #f8fafc;
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 30px;
          border-left: 4px solid ${options.customBranding?.primaryColor || '#3b82f6'};
        }
        
        .score-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }
        
        .overall-score {
          text-align: center;
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .gauge-container {
          position: relative;
          width: 200px;
          height: 100px;
          margin: 0 auto 20px;
        }
        
        .gauge-svg {
          width: 100%;
          height: 100%;
        }
        
        .score-text {
          font-size: 36px;
          font-weight: bold;
          color: ${options.customBranding?.primaryColor || '#3b82f6'};
          margin-bottom: 10px;
        }
        
        .category-badge {
          background: ${this.getCategoryColor(response.category)};
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          display: inline-block;
        }
        
        .radar-section {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .radar-container {
          width: 300px;
          height: 300px;
          margin: 0 auto;
        }
        
        .pillars-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 30px;
        }
        
        .pillar-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border-left: 4px solid ${options.customBranding?.primaryColor || '#3b82f6'};
        }
        
        .pillar-name {
          font-weight: 600;
          margin-bottom: 10px;
          text-transform: capitalize;
        }
        
        .pillar-score {
          font-size: 24px;
          font-weight: bold;
          color: ${options.customBranding?.primaryColor || '#3b82f6'};
        }
        
        .pillar-bar {
          width: 100%;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          margin-top: 10px;
          overflow: hidden;
        }
        
        .pillar-progress {
          height: 100%;
          background: ${options.customBranding?.primaryColor || '#3b82f6'};
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        
        .metadata {
          background: #f8fafc;
          border-radius: 8px;
          padding: 20px;
          margin-top: 30px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }
        
        .metadata-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .metadata-label {
          font-weight: 600;
          color: #6b7280;
        }
        
        .metadata-value {
          color: #374151;
        }
        
        .footer {
          margin-top: 40px;
          padding: 20px 30px;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
          border-top: 1px solid #e5e7eb;
        }
        
        @media print {
          body { -webkit-print-color-adjust: exact; }
          .header { break-inside: avoid; }
          .pillar-card { break-inside: avoid; margin-bottom: 15px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">
          ${options.logoUrl ? `<img src="${options.logoUrl}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain;">` : '🤖'}
        </div>
        <h1>AI Readiness Assessment Report</h1>
        <p>${options.customBranding?.companyName || 'AI Readiness Assessment Platform'}</p>
      </div>
      
      <div class="content">
        <div class="summary-section">
          <h2 style="margin-bottom: 15px; color: #1f2937;">Executive Summary</h2>
          <p style="font-size: 16px; color: #4b5563;">
            This assessment evaluates your organization's readiness for AI adoption across multiple key dimensions. 
            The overall score reflects your current preparedness level and highlights areas for improvement.
          </p>
        </div>
        
        <div class="score-grid">
          <div class="overall-score">
            <h3 style="margin-bottom: 20px; color: #1f2937;">Overall Readiness Score</h3>
            <div class="gauge-container">
              <svg class="gauge-svg" viewBox="0 0 200 100">
                <!-- Gauge background -->
                <path d="M 20 80 A 80 80 0 0 1 180 80" 
                      fill="none" 
                      stroke="#e5e7eb" 
                      stroke-width="12"/>
                <!-- Gauge progress -->
                <path d="M 20 80 A 80 80 0 ${gaugeAngle > 90 ? '1' : '0'} 1 ${100 + 80 * Math.cos((gaugeAngle - 90) * Math.PI / 180)} ${80 + 80 * Math.sin((gaugeAngle - 90) * Math.PI / 180)}" 
                      fill="none" 
                      stroke="${options.customBranding?.primaryColor || '#3b82f6'}" 
                      stroke-width="12"
                      stroke-linecap="round"/>
                <!-- Score text -->
                <text x="100" y="65" text-anchor="middle" font-size="24" font-weight="bold" fill="${options.customBranding?.primaryColor || '#3b82f6'}">
                  ${Math.round(response.overall)}%
                </text>
              </svg>
            </div>
            <div class="category-badge">${response.category}</div>
          </div>
          
          <div class="radar-section">
            <h3 style="margin-bottom: 20px; color: #1f2937; text-align: center;">Pillar Breakdown</h3>
            <div class="radar-container">
              <svg viewBox="0 0 200 200" style="width: 100%; height: 100%;">
                <!-- Grid circles -->
                <circle cx="100" cy="100" r="20" fill="none" stroke="#e5e7eb" stroke-width="1"/>
                <circle cx="100" cy="100" r="40" fill="none" stroke="#e5e7eb" stroke-width="1"/>
                <circle cx="100" cy="100" r="60" fill="none" stroke="#e5e7eb" stroke-width="1"/>
                <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" stroke-width="1"/>
                
                <!-- Grid lines -->
                ${pillars.map((_, index) => {
                  const angle = (index * 360) / pillars.length;
                  const x = 100 + 80 * Math.cos((angle - 90) * Math.PI / 180);
                  const y = 100 + 80 * Math.sin((angle - 90) * Math.PI / 180);
                  return `<line x1="100" y1="100" x2="${x}" y2="${y}" stroke="#e5e7eb" stroke-width="1"/>`;
                }).join('')}
                
                <!-- Data polygon -->
                <polygon points="${radarData.map(point => `${point.x},${point.y}`).join(' ')}"
                         fill="${options.customBranding?.primaryColor || '#3b82f6'}40"
                         stroke="${options.customBranding?.primaryColor || '#3b82f6'}"
                         stroke-width="2"/>
                
                <!-- Data points -->
                ${radarData.map(point => `<circle cx="${point.x}" cy="${point.y}" r="3" fill="${options.customBranding?.primaryColor || '#3b82f6'}"/>`).join('')}
              </svg>
            </div>
          </div>
        </div>
        
        <div class="pillars-grid">
          ${pillars.map(pillar => `
            <div class="pillar-card">
              <div class="pillar-name">${pillar.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</div>
              <div class="pillar-score">${Math.round(pillarScores[pillar])}%</div>
              <div class="pillar-bar">
                <div class="pillar-progress" style="width: ${pillarScores[pillar]}%"></div>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="metadata">
          <div class="metadata-item">
            <span class="metadata-label">Organization:</span>
            <span class="metadata-value">${response.orgName || 'Not specified'}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Industry:</span>
            <span class="metadata-value">${response.industry || 'Not specified'}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Assessment Date:</span>
            <span class="metadata-value">${format(new Date(response.createdAt), 'MMMM d, yyyy')}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Report Generated:</span>
            <span class="metadata-value">${format(new Date(), 'MMMM d, yyyy')}</span>
          </div>
        </div>
      </div>
      
      <div class="footer">
        <p>This report was generated by the AI Readiness Assessment Platform. For more information and recommendations, please contact your assessment administrator.</p>
        <p style="margin-top: 10px;">&copy; ${new Date().getFullYear()} ${options.customBranding?.companyName || 'AI Readiness Assessment Platform'}. All rights reserved.</p>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Get color for category badge based on category
   */
  private static getCategoryColor(category: string): string {
    const colorMap: Record<string, string> = {
      'Beginner': '#ef4444',      // Red
      'Developing': '#f59e0b',    // Orange  
      'Intermediate': '#eab308',  // Yellow
      'Advanced': '#10b981',      // Green
      'Expert': '#3b82f6',        // Blue
    };
    
    return colorMap[category] || '#6b7280'; // Default gray
  }
}