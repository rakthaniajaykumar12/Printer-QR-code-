import io
import qrcode
from PIL import Image, ImageDraw, ImageFont


def generate_shop_qr_image(portal_url: str, shop_name: str = "Smart Xerox") -> io.BytesIO:
    """Generate a high-quality printable QR code PNG with shop header and scan instruction."""
    # Create base QR
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
    )
    qr.add_data(portal_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="#0b132b", back_color="#ffffff").convert("RGBA")

    qr_width, qr_height = qr_img.size

    # Card layout dimensions
    padding = 40
    header_height = 80
    footer_height = 80
    total_width = qr_width + (padding * 2)
    total_height = qr_height + header_height + footer_height

    # Canvas
    canvas = Image.new("RGBA", (total_width, total_height), "#ffffff")
    draw = ImageDraw.Draw(canvas)

    # Top banner background
    draw.rectangle([0, 0, total_width, header_height], fill="#0b132b")

    # Header text (Shop Name)
    try:
        # Default fallback font
        font_header = ImageFont.load_default(size=24)
        font_sub = ImageFont.load_default(size=14)
        font_footer = ImageFont.load_default(size=16)
    except Exception:
        font_header = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        font_footer = ImageFont.load_default()

    draw.text((total_width / 2, 28), shop_name.upper(), fill="#ffffff", anchor="mm", font=font_header)
    draw.text((total_width / 2, 54), "SCAN TO PRINT DOCUMENTS", fill="#a78bfa", anchor="mm", font=font_sub)

    # Paste QR code centered
    canvas.paste(qr_img, (padding, header_height + 10), qr_img)

    # Footer instruction
    footer_y = header_height + qr_height + 25
    draw.text((total_width / 2, footer_y), "Point phone camera to upload & print", fill="#334155", anchor="mm", font=font_footer)
    draw.text((total_width / 2, footer_y + 25), "Epson EcoTank L3250 Ready", fill="#64748b", anchor="mm", font=font_sub)

    output = io.BytesIO()
    canvas.save(output, format="PNG")
    output.seek(0)
    return output
