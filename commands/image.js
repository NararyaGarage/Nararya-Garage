/**
 * AI Image Command
 * 
 * Command untuk menghasilkan gambar dari prompt.
 * Image generator sederhana tanpa API eksternal.
 * 
 * © 2025 Nararya Garage Team - All Rights Reserved
 */

const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { logger } = require('../../utils/logger');
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Direktori untuk menyimpan gambar
const imageDir = path.join(__dirname, '..', '..', 'data', 'generated_images');

// Pastikan direktori ada
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

// Daftar style yang tersedia
const AVAILABLE_STYLES = [
  { id: 'anime', name: 'Anime', desc: 'Gaya anime Jepang', color: '#ff78a9' },
  { id: 'pixel', name: 'Pixel Art', desc: 'Gaya pixel art retro', color: '#ffaa00' },
  { id: 'realistic', name: 'Realistic', desc: 'Gaya realistis', color: '#22a0ff' },
  { id: 'sketch', name: 'Sketch', desc: 'Gaya sketsa pensil', color: '#777777' },
  { id: 'vaporwave', name: 'Vaporwave', desc: 'Gaya vaporwave retro', color: '#ca78ff' },
  { id: 'pop', name: 'Pop Art', desc: 'Gaya pop art cerah', color: '#ff2255' },
  { id: 'jkt', name: 'JKT48', desc: 'Gaya dengan tema JKT48', color: '#ff6200' }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('image')
    .setDescription('Buat gambar AI berdasarkan prompt')
    .addStringOption(option =>
      option
        .setName('prompt')
        .setDescription('Deskripsi gambar yang ingin dibuat')
        .setRequired(true))
    .addStringOption(option =>
      option
        .setName('style')
        .setDescription('Style gambar yang diinginkan')
        .setRequired(false)
        .addChoices(
          { name: 'Anime', value: 'anime' },
          { name: 'Pixel Art', value: 'pixel' },
          { name: 'Realistic', value: 'realistic' },
          { name: 'Sketch', value: 'sketch' },
          { name: 'Vaporwave', value: 'vaporwave' },
          { name: 'Pop Art', value: 'pop' },
          { name: 'JKT48', value: 'jkt' }
        ))
    .addIntegerOption(option =>
      option
        .setName('size')
        .setDescription('Ukuran gambar')
        .setRequired(false)
        .addChoices(
          { name: 'Kecil (256x256)', value: 256 },
          { name: 'Medium (512x512)', value: 512 },
          { name: 'Besar (1024x1024)', value: 1024 }
        )),

  async execute(interaction) {
    try {
      const prompt = interaction.options.getString('prompt');
      const style = interaction.options.getString('style') || 'anime';
      const size = interaction.options.getInteger('size') || 512;
      
      // Validasi prompt
      if (prompt.length < 3) {
        return interaction.reply({
          content: 'Prompt terlalu pendek. Berikan deskripsi yang lebih detail.',
          ephemeral: true
        });
      }
      
      if (prompt.length > 200) {
        return interaction.reply({
          content: 'Prompt terlalu panjang. Maksimal 200 karakter.',
          ephemeral: true
        });
      }
      
      // Defer reply karena proses bisa memakan waktu
      await interaction.deferReply();
      
      // Buat gambar berdasarkan prompt dan style
      const imageBuffer = await generateImage(prompt, style, size);
      
      // Buat file attachment dari buffer
      const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.png`;
      const imagePath = path.join(imageDir, filename);
      fs.writeFileSync(imagePath, imageBuffer);
      const attachment = new AttachmentBuilder(imageBuffer, { name: filename });
      
      // Dapatkan info style
      const styleInfo = AVAILABLE_STYLES.find(s => s.id === style);
      
      // Buat embed
      const embed = new EmbedBuilder()
        .setTitle('🎨 AI Image Generator')
        .setDescription(`**Prompt:** ${prompt}`)
        .setColor(styleInfo.color)
        .addFields(
          { name: 'Style', value: styleInfo.name, inline: true },
          { name: 'Size', value: `${size}x${size}`, inline: true }
        )
        .setImage(`attachment://${filename}`)
        .setFooter({ text: '© 2025 Nararya Garage Team - All Rights Reserved' })
        .setTimestamp();
      
      // Kirim embed dengan gambar
      await interaction.editReply({
        embeds: [embed],
        files: [attachment]
      });
      
      // Simpan data penggunaan (opsional)
      saveImageData(interaction.user.id, prompt, style, size, filename);
      
    } catch (error) {
      logger.error('Error in image command:', error);
      
      if (interaction.deferred) {
        await interaction.editReply('Maaf, terjadi kesalahan saat menghasilkan gambar. Silakan coba lagi nanti.');
      } else {
        await interaction.reply({
          content: 'Maaf, terjadi kesalahan saat menghasilkan gambar. Silakan coba lagi nanti.',
          ephemeral: true
        });
      }
    }
  }
};

/**
 * Simpan data penggunaan AI Image
 * @param {string} userId - ID user
 * @param {string} prompt - Prompt yang digunakan
 * @param {string} style - Style yang dipilih
 * @param {number} size - Ukuran gambar
 * @param {string} filename - Nama file gambar
 */
function saveImageData(userId, prompt, style, size, filename) {
  try {
    const dataPath = path.join(__dirname, '..', '..', 'data', 'image_usage.json');
    
    // Buat file jika belum ada
    if (!fs.existsSync(dataPath)) {
      fs.writeFileSync(dataPath, JSON.stringify({ images: [] }, null, 2));
    }
    
    // Baca data yang ada
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Tambahkan data baru
    data.images.push({
      userId,
      prompt,
      style,
      size,
      filename,
      timestamp: new Date().toISOString()
    });
    
    // Batasi jumlah history (simpan 100 terakhir)
    if (data.images.length > 100) {
      data.images = data.images.slice(-100);
    }
    
    // Simpan data
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch (error) {
    logger.error('Error saving image data:', error);
  }
}

/**
 * Generate gambar berdasarkan prompt dan style
 * @param {string} prompt - Prompt untuk gambar
 * @param {string} style - Style gambar
 * @param {number} size - Ukuran gambar (width & height)
 * @returns {Buffer} Buffer gambar PNG
 */
async function generateImage(prompt, style, size) {
  // Buat canvas dengan ukuran yang diminta
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Buat background berdasarkan style
  let gradientColors, patterns;
  
  switch (style) {
    case 'anime':
      gradientColors = ['#ffd4e3', '#a2d2ff'];
      break;
    case 'pixel':
      gradientColors = ['#ffa500', '#4b0082'];
      drawPixelPattern(ctx, size);
      break;
    case 'realistic':
      gradientColors = ['#c9d6ff', '#e2e2e2'];
      break;
    case 'sketch':
      gradientColors = ['#ffffff', '#e0e0e0'];
      drawSketchPattern(ctx, size);
      break;
    case 'vaporwave':
      gradientColors = ['#fd1d92', '#490cb0'];
      drawVaporwavePattern(ctx, size);
      break;
    case 'pop':
      gradientColors = ['#ff0055', '#ffaa00'];
      drawPopArtPattern(ctx, size);
      break;
    case 'jkt':
      gradientColors = ['#ff6200', '#ff9500'];
      drawJKT48Pattern(ctx, size);
      break;
    default:
      gradientColors = ['#3498db', '#8e44ad'];
  }
  
  // Buat gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, gradientColors[0]);
  gradient.addColorStop(1, gradientColors[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Generate konten berdasarkan prompt
  const seed = createSeedFromPrompt(prompt);
  await drawBasedOnPrompt(ctx, prompt, style, size, seed);
  
  // Tambahkan teks prompt di bagian bawah sebagai watermark samar
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = '#000000';
  ctx.font = `${Math.max(12, size * 0.02)}px Arial`;
  ctx.fillText(`Nararya Garage AI • ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`, 10, size - 20);
  ctx.globalAlpha = 1.0;
  
  // Konversi ke buffer
  return canvas.toBuffer('image/png');
}

/**
 * Buat seed number berdasarkan prompt
 * @param {string} prompt - Prompt text
 * @returns {number} Seed number
 */
function createSeedFromPrompt(prompt) {
  const hash = crypto.createHash('md5').update(prompt).digest('hex');
  return parseInt(hash.substring(0, 8), 16);
}

/**
 * Draw pattern untuk style pixel art
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} size - Canvas size
 */
function drawPixelPattern(ctx, size) {
  const pixelSize = Math.max(4, size * 0.02);
  const cols = Math.floor(size / pixelSize);
  const rows = Math.floor(size / pixelSize);
  
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if ((i + j) % 4 === 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.1})`;
        ctx.fillRect(i * pixelSize, j * pixelSize, pixelSize, pixelSize);
      }
    }
  }
}

/**
 * Draw pattern untuk style sketch
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} size - Canvas size
 */
function drawSketchPattern(ctx, size) {
  // Tambahkan garis-garis tipis acak untuk efek sketsa
  ctx.strokeStyle = '#aaaaaa';
  ctx.lineWidth = Math.max(1, size * 0.002);
  
  for (let i = 0; i < 50; i++) {
    const x1 = Math.random() * size;
    const y1 = Math.random() * size;
    const length = Math.random() * size * 0.2;
    const angle = Math.random() * Math.PI * 2;
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + Math.cos(angle) * length, y1 + Math.sin(angle) * length);
    ctx.stroke();
  }
}

/**
 * Draw pattern untuk style vaporwave
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} size - Canvas size
 */
function drawVaporwavePattern(ctx, size) {
  // Grid pattern
  const gridSize = Math.max(20, size * 0.05);
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
  ctx.lineWidth = Math.max(1, size * 0.002);
  
  // Horizontal lines
  for (let y = 0; y < size; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }
  
  // Vertical lines
  for (let x = 0; x < size; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }
  
  // Sun/circle
  const centerX = size / 2;
  const centerY = size * 0.7;
  const radius = size * 0.15;
  
  const sunGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
  sunGradient.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
  sunGradient.addColorStop(1, 'rgba(255, 0, 128, 0)');
  
  ctx.fillStyle = sunGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw pattern untuk style pop art
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} size - Canvas size
 */
function drawPopArtPattern(ctx, size) {
  const dotSize = Math.max(5, size * 0.01);
  const spacing = dotSize * 2.5;
  
  for (let x = spacing; x < size; x += spacing) {
    for (let y = spacing; y < size; y += spacing) {
      const opacity = Math.random() * 0.5 + 0.2;
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      
      ctx.beginPath();
      ctx.arc(x, y, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/**
 * Draw pattern untuk style JKT48
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} size - Canvas size
 */
function drawJKT48Pattern(ctx, size) {
  // JKT48 warna oranye pattern
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Tambahkan cahaya radial di tengah
  const spotlightGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 0.8);
  spotlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
  spotlightGradient.addColorStop(1, 'rgba(255, 98, 0, 0)');
  
  ctx.fillStyle = spotlightGradient;
  ctx.fillRect(0, 0, size, size);
  
  // Tambahkan pattern sinar menyebar
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = Math.max(1, size * 0.003);
  
  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(angle) * size,
      centerY + Math.sin(angle) * size
    );
    ctx.stroke();
  }
}

/**
 * Draw konten berdasarkan prompt
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} prompt - Prompt text
 * @param {string} style - Style gambar
 * @param {number} size - Canvas size
 * @param {number} seed - Random seed
 */
async function drawBasedOnPrompt(ctx, prompt, style, size, seed) {
  // Seed random dengan nilai dari prompt
  const random = (min, max) => {
    seed = (seed * 9301 + 49297) % 233280;
    const rnd = seed / 233280;
    return min + rnd * (max - min);
  };
  
  const lowerPrompt = prompt.toLowerCase();
  
  // Pola warna dasar berdasarkan kata kunci dalam prompt
  let primaryColor = '#000000';
  
  // Deteksi warna dari prompt
  if (lowerPrompt.includes('merah')) primaryColor = '#ff0000';
  else if (lowerPrompt.includes('biru')) primaryColor = '#0000ff';
  else if (lowerPrompt.includes('hijau')) primaryColor = '#00ff00';
  else if (lowerPrompt.includes('kuning')) primaryColor = '#ffff00';
  else if (lowerPrompt.includes('ungu')) primaryColor = '#800080';
  else if (lowerPrompt.includes('pink')) primaryColor = '#ff66b2';
  else if (lowerPrompt.includes('oranye') || lowerPrompt.includes('orange')) primaryColor = '#ff6600';
  else if (lowerPrompt.includes('hitam')) primaryColor = '#000000';
  else if (lowerPrompt.includes('putih')) primaryColor = '#ffffff';
  else {
    // Random color jika tidak ada keyword warna
    primaryColor = `hsl(${random(0, 360)}, 70%, 50%)`;
  }
  
  // Set shape-shape berdasarkan keyword
  const shapes = [];
  
  // Deteksi objek dalam prompt
  if (lowerPrompt.includes('lingkaran') || lowerPrompt.includes('bulat') || lowerPrompt.includes('circle')) {
    // Tambahkan beberapa lingkaran
    for (let i = 0; i < 3; i++) {
      shapes.push({
        type: 'circle',
        x: random(size * 0.2, size * 0.8),
        y: random(size * 0.2, size * 0.8),
        radius: random(size * 0.05, size * 0.2),
        color: `${primaryColor}${Math.floor(random(50, 99)).toString(16)}`
      });
    }
  }
  
  if (lowerPrompt.includes('kotak') || lowerPrompt.includes('persegi') || lowerPrompt.includes('square')) {
    // Tambahkan beberapa kotak
    for (let i = 0; i < 3; i++) {
      const rectSize = random(size * 0.1, size * 0.3);
      shapes.push({
        type: 'rect',
        x: random(size * 0.1, size * 0.9 - rectSize),
        y: random(size * 0.1, size * 0.9 - rectSize),
        width: rectSize,
        height: rectSize,
        color: `${primaryColor}${Math.floor(random(50, 99)).toString(16)}`
      });
    }
  }
  
  if (lowerPrompt.includes('segitiga') || lowerPrompt.includes('triangle')) {
    // Tambahkan beberapa segitiga
    for (let i = 0; i < 3; i++) {
      const triangleSize = random(size * 0.1, size * 0.25);
      const x = random(size * 0.2, size * 0.8);
      const y = random(size * 0.2, size * 0.8);
      
      shapes.push({
        type: 'triangle',
        points: [
          { x, y: y - triangleSize },
          { x: x - triangleSize, y: y + triangleSize },
          { x: x + triangleSize, y: y + triangleSize }
        ],
        color: `${primaryColor}${Math.floor(random(50, 99)).toString(16)}`
      });
    }
  }
  
  // Spesial: prompt berisi JKT48
  if (lowerPrompt.includes('jkt48') || lowerPrompt.includes('idol')) {
    // Tambahkan pola khusus JKT48
    // Logo sederhana
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.25;
    
    ctx.fillStyle = '#ff6200'; // Warna JKT48
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${radius * 0.7}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('JKT48', centerX, centerY);
  }
  
  // Default: Jika tidak ada keyword spesifik atau shapes terlalu sedikit
  if (shapes.length < 2) {
    const numShapes = Math.floor(random(5, 15));
    
    for (let i = 0; i < numShapes; i++) {
      const shapeType = Math.floor(random(0, 3));
      
      switch (shapeType) {
        case 0: // Circle
          shapes.push({
            type: 'circle',
            x: random(0, size),
            y: random(0, size),
            radius: random(size * 0.02, size * 0.15),
            color: `hsla(${random(0, 360)}, 70%, 50%, ${random(0.3, 0.7)})`
          });
          break;
        
        case 1: // Rectangle
          const rectWidth = random(size * 0.05, size * 0.2);
          const rectHeight = random(size * 0.05, size * 0.2);
          shapes.push({
            type: 'rect',
            x: random(0, size - rectWidth),
            y: random(0, size - rectHeight),
            width: rectWidth,
            height: rectHeight,
            color: `hsla(${random(0, 360)}, 70%, 50%, ${random(0.3, 0.7)})`
          });
          break;
        
        case 2: // Triangle
          const triangleSize = random(size * 0.05, size * 0.15);
          const x = random(triangleSize, size - triangleSize);
          const y = random(triangleSize, size - triangleSize);
          
          shapes.push({
            type: 'triangle',
            points: [
              { x, y: y - triangleSize },
              { x: x - triangleSize, y: y + triangleSize },
              { x: x + triangleSize, y: y + triangleSize }
            ],
            color: `hsla(${random(0, 360)}, 70%, 50%, ${random(0.3, 0.7)})`
          });
          break;
      }
    }
  }
  
  // Gambar semua shapes
  shapes.forEach(shape => {
    ctx.fillStyle = shape.color;
    
    switch (shape.type) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
        ctx.fill();
        break;
      
      case 'rect':
        ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
        break;
      
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(shape.points[0].x, shape.points[0].y);
        ctx.lineTo(shape.points[1].x, shape.points[1].y);
        ctx.lineTo(shape.points[2].x, shape.points[2].y);
        ctx.closePath();
        ctx.fill();
        break;
    }
  });
  
  // Khusus untuk style "anime" dan "jkt"
  if (style === 'anime' || style === 'jkt') {
    // Tambahkan simple anime eyes jika ada keyword wajah/karakter
    if (lowerPrompt.includes('wajah') || lowerPrompt.includes('karakter') || 
        lowerPrompt.includes('face') || lowerPrompt.includes('character') || 
        lowerPrompt.includes('idol') || lowerPrompt.includes('girl') || 
        lowerPrompt.includes('gadis')) {
      
      const faceX = size / 2;
      const faceY = size / 2;
      const faceSize = size * 0.4;
      
      // Head outline
      ctx.fillStyle = '#FFF5E0';
      ctx.beginPath();
      ctx.arc(faceX, faceY, faceSize / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Eyes
      const eyeSize = faceSize * 0.15;
      const eyeSpacing = faceSize * 0.25;
      
      ctx.fillStyle = '#000000';
      
      // Left eye
      ctx.beginPath();
      ctx.ellipse(
        faceX - eyeSpacing, 
        faceY - faceSize * 0.05, 
        eyeSize, eyeSize / 2, 
        0, 0, Math.PI * 2
      );
      ctx.fill();
      
      // Right eye
      ctx.beginPath();
      ctx.ellipse(
        faceX + eyeSpacing, 
        faceY - faceSize * 0.05, 
        eyeSize, eyeSize / 2, 
        0, 0, Math.PI * 2
      );
      ctx.fill();
      
      // Smile
      ctx.beginPath();
      ctx.arc(
        faceX, 
        faceY + faceSize * 0.2, 
        faceSize * 0.2, 
        0.1, Math.PI - 0.1
      );
      ctx.stroke();
    }
  }
  
  // Efek akhir khusus per style
  switch (style) {
    case 'pixel':
      pixelateImage(ctx, size, Math.max(4, Math.floor(size / 64)));
      break;
    
    case 'sketch':
      applySketchEffect(ctx, size);
      break;
    
    case 'vaporwave':
      applyVaporwaveEffect(ctx, size);
      break;
    
    case 'anime':
      applySoftEffect(ctx, size);
      break;
      
    case 'jkt':
      applyJKT48Effect(ctx, size);
      break;
  }
}

/**
 * Efek pixelate untuk pixel art style
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} size - Canvas size
 * @param {number} pixelSize - Size of pixels
 */
function pixelateImage(ctx, size, pixelSize) {
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  
  for (let y = 0; y < size; y += pixelSize) {
    for (let x = 0; x < size; x += pixelSize) {
      // Get the color at the top-left pixel of the current block
      const i = (y * size + x) * 4;
      const r = data[i];
      const g = data[i+1];
      const b = data[i+2];
      
      // Fill the entire block with that color
      for (let py = 0; py < pixelSize && y + py < size; py++) {
        for (let px = 0; px < pixelSize && x + px < size; px++) {
          const idx = ((y + py) * size + (x + px)) * 4;
          data[idx] = r;
          data[idx+1] = g;
          data[idx+2] = b;
        }
      }
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Apply sketch effect
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} size - Canvas size
 */
function applySketchEffect(ctx, size) {
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i+1] + data[i+2]) / 3;
    
    // Convert to grayscale with sketch noise
    const noise = Math.random() * 20 - 10;
    const val = Math.min(255, Math.max(0, avg + noise));
    
    data[i] = val;
    data[i+1] = val;
    data[i+2] = val;
  }
  
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Apply vaporwave effect
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} size - Canvas size
 */
function applyVaporwaveEffect(ctx, size) {
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    // Shift colors to create vaporwave aesthetic
    data[i] = Math.min(255, data[i] * 0.8 + 50);     // Red
    data[i+1] = Math.min(255, data[i+1] * 0.5 + 25); // Green
    data[i+2] = Math.min(255, data[i+2] * 1.2 + 50); // Blue
  }
  
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Apply soft effect for anime style
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} size - Canvas size
 */
function applySoftEffect(ctx, size) {
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  
  for (let y = 1; y < size - 1; y++) {
    for (let x = 1; x < size - 1; x++) {
      const idx = (y * size + x) * 4;
      
      // Simple box blur
      if (y % 2 === 0 && x % 2 === 0) {
        const prevRow = ((y - 1) * size + x) * 4;
        const nextRow = ((y + 1) * size + x) * 4;
        const prevCol = (y * size + (x - 1)) * 4;
        const nextCol = (y * size + (x + 1)) * 4;
        
        data[idx] = (data[prevRow] + data[nextRow] + data[prevCol] + data[nextCol] + data[idx]) / 5;
        data[idx+1] = (data[prevRow+1] + data[nextRow+1] + data[prevCol+1] + data[nextCol+1] + data[idx+1]) / 5;
        data[idx+2] = (data[prevRow+2] + data[nextRow+2] + data[prevCol+2] + data[nextCol+2] + data[idx+2]) / 5;
      }
      
      // Boost saturation a bit
      const r = data[idx];
      const g = data[idx+1];
      const b = data[idx+2];
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const delta = max - min;
      const lightness = (max + min) / 2;
      
      if (delta !== 0) {
        const satBoost = 0.2;
        
        if (r === max) {
          data[idx] = r;
          data[idx+1] = g + (g - min) * satBoost;
          data[idx+2] = b + (b - min) * satBoost;
        } else if (g === max) {
          data[idx] = r + (r - min) * satBoost;
          data[idx+1] = g;
          data[idx+2] = b + (b - min) * satBoost;
        } else {
          data[idx] = r + (r - min) * satBoost;
          data[idx+1] = g + (g - min) * satBoost;
          data[idx+2] = b;
        }
      }
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Apply JKT48 effect
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} size - Canvas size
 */
function applyJKT48Effect(ctx, size) {
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    // Boost orange/red channels untuk warna JKT48
    data[i] = Math.min(255, data[i] * 1.2); // Red
    data[i+1] = Math.min(255, data[i+1] * 0.9); // Green - reduce slightly
    
    // Tambahkan tint oranye
    if (data[i] > data[i+1] && data[i] > data[i+2]) {
      data[i] = Math.min(255, data[i] + 15);
      data[i+1] = Math.min(255, data[i+1] + 5);
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  // Tambahkan subtle vignette
  const gradient = ctx.createRadialGradient(size/2, size/2, size*0.3, size/2, size/2, size*0.7);
  gradient.addColorStop(0, 'rgba(255,255,255,0)');
  gradient.addColorStop(1, 'rgba(255,98,0,0.2)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
}