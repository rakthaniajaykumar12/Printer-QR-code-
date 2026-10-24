#!/usr/bin/env python3
"""
Smart Xerox — Shop QR Code Generator CLI Script
Generate a high-resolution, printable QR card image with shop branding.

Usage:
    python generate_qr.py --url https://my-smart-xerox.onrender.com --shop "Smart Xerox" --output shop_qr.png
"""

import argparse
import sys
import os

# Add backend directory to sys.path to reuse qr service
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, "..", "backend")
sys.path.insert(0, backend_dir)

try:
    from app.services.qr import generate_shop_qr_image
except ImportError:
    print("Error: Could not import generate_shop_qr_image. Ensure pillow and qrcode are installed.")
    sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Generate Smart Xerox Printable QR Code")
    parser.add_argument("--url", required=True, help="Full URL of customer printing website (e.g. https://my-shop.com)")
    parser.add_argument("--shop", default="Smart Xerox", help="Shop Name to display on banner")
    parser.add_argument("--output", default="SmartXerox_Shop_QR.png", help="Output filename (.png)")

    args = parser.parse_args()

    print(f"Generating QR code for: {args.url}")
    print(f"Shop Name: {args.shop}")

    qr_io = generate_shop_qr_image(portal_url=args.url, shop_name=args.shop)

    with open(args.output, "wb") as f:
        f.write(qr_io.getvalue())

    print(f"[SUCCESS] Printable shop QR code saved to: {os.path.abspath(args.output)}")
    print("Tip: Print this image on your Epson EcoTank L3250 (A4/photo paper) and laminate or stick it near the shop counter.")


if __name__ == "__main__":
    main()
