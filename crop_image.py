import sys
from PIL import Image

def crop_bottom(image_path, output_path, pixels_to_crop=60):
    try:
        img = Image.open(image_path)
        width, height = img.size
        # Crop the bottom 'pixels_to_crop' pixels
        cropped_img = img.crop((0, 0, width, height - pixels_to_crop))
        cropped_img.save(output_path)
        print(f"Successfully cropped {image_path} and saved to {output_path}")
    except Exception as e:
        print(f"Error cropping image: {e}")
        sys.exit(1)

if __name__ == "__main__":
    crop_bottom("server/uploads/avatars/shanthi_bhat_mysuru.png", "server/uploads/avatars/shanthi_bhat_mysuru_cropped.png")
