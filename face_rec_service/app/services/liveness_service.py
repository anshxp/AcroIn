from __future__ import annotations

import os
from pathlib import Path
from typing import Any


class LivenessModel:
    """Production adapter for a separately validated anti-spoofing ONNX model.

    The service deliberately fails closed when the model is not configured instead
    of treating face detection or image quality as proof of liveness.
    """

    def __init__(self) -> None:
        self.model_path = Path(os.getenv("LIVENESS_MODEL_PATH", "").strip())
        self.threshold = float(os.getenv("LIVENESS_THRESHOLD", "0.80"))
        self._session: Any = None

    def load(self) -> None:
        if not self.model_path:
            return
        if not self.model_path.is_file():
            raise RuntimeError("Configured liveness model does not exist")
        import onnxruntime as ort
        self._session = ort.InferenceSession(str(self.model_path), providers=["CPUExecutionProvider"])

    @property
    def configured(self) -> bool:
        return self._session is not None

    def verify(self, image: Any) -> dict[str, Any]:
        if self._session is None:
            raise RuntimeError("Liveness model is not configured")

        # The exact preprocessing contract is model-specific. A production model
        # must be validated and its preprocessing supplied with the deployment.
        # Do not silently guess a tensor layout and create a false security result.
        raise RuntimeError("Liveness model preprocessing contract is not configured")


liveness_model = LivenessModel()
