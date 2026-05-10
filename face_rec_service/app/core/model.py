import insightface

_model = None

def get_model():
    global _model
    if _model is None:
        _model = insightface.app.FaceAnalysis(name='buffalo_l')
        _model.prepare(ctx_id=0)  # CPU
    return _model