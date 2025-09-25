import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image
import os

# ---- Siamese Network Definition ----
class SiameseNetwork(nn.Module):
    def __init__(self, input_size=(1, 128, 128)):
        super(SiameseNetwork, self).__init__()
        self.cnn = nn.Sequential(
            nn.Conv2d(1, 32, kernel_size=5),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, kernel_size=5),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Conv2d(64, 128, kernel_size=3),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2)
        )
        with torch.no_grad():
            dummy_input = torch.zeros(1, *input_size)
            dummy_output = self.cnn(dummy_input)
            flattened_size = dummy_output.view(1, -1).size(1)

        self.fc = nn.Sequential(
            nn.Linear(flattened_size, 512),
            nn.ReLU(inplace=True),
            nn.Linear(512, 128)
        )

    def forward_once(self, x):
        x = self.cnn(x)
        x = x.view(x.size(0), -1)
        x = self.fc(x)
        return x

    def forward(self, x1, x2):
        return self.forward_once(x1), self.forward_once(x2)


# ---- Load Trained Model ----
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model_path = os.path.join(os.path.dirname(__file__), "siamese_signature.pth")  # Ensure path is correct
model = SiameseNetwork(input_size=(1,128,128)).to(device)
model.load_state_dict(torch.load(model_path, map_location=device))
model.eval()

# ---- Transform for preprocessing images ----
transform = transforms.Compose([
    transforms.Resize((128,128)),
    transforms.ToTensor(),
    transforms.Normalize((0.5,), (0.5,))
])

# ---- Signature Verification Function ----
def verify_signature(test_img_path, reference_img_path, threshold=1.0):
    """
    Compares the test signature to a reference signature.

    Returns:
        distance (float): Euclidean distance between embeddings
        is_genuine (bool): True if distance < threshold
    """
    img1 = Image.open(test_img_path).convert("L")
    img2 = Image.open(reference_img_path).convert("L")

    img1, img2 = transform(img1).unsqueeze(0).to(device), transform(img2).unsqueeze(0).to(device)

    with torch.no_grad():
        out1, out2 = model(img1, img2)
        euclidean_distance = F.pairwise_distance(out1, out2).item()

    return euclidean_distance, euclidean_distance < threshold
