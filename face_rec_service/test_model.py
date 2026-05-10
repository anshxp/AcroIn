from insightface.app import FaceAnalysis
import cv2

# load model
app = FaceAnalysis(name='buffalo_l')
app.prepare(ctx_id=0)  # CPU

# load test image
img = cv2.imread("me.png")

faces = app.get(img)

print(f"Faces detected: {len(faces)}")

if len(faces) > 0:
    print("Embedding shape:", faces[0].embedding.shape)