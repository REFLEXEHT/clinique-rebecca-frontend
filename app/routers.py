
# ══════════════════════════════════════════════════════════════════════════════
# PATIENTS — Création et gestion (accessible à tous les rôles staff)
# ══════════════════════════════════════════════════════════════════════════════
@router.post("/patients", status_code=201, tags=["Patients"])
async def create_patient(data: dict, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Générer code unique #RB-XXX
    count = db.query(models.Patient).count()
    code = f"#RB-{str(count + 1).zfill(3)}"
    patient = models.Patient(
        code=code,
        nom=data.get("nom", ""),
        prenom=data.get("prenom", ""),
        date_naissance=data.get("date_naissance", ""),
        sexe=data.get("sexe", ""),
        telephone=data.get("telephone", ""),
        email=data.get("email", ""),
        adresse=data.get("adresse", ""),
        groupe_sanguin=data.get("groupe_sanguin", ""),
        allergies=data.get("allergies", ""),
        antecedents=data.get("antecedents", ""),
        notes=data.get("notes", ""),
        created_by=current_user.id,
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return {"id": patient.id, "code": patient.code, "nom": patient.nom, "message": f"Patient {code} créé avec succès"}

@router.get("/patients/search", tags=["Patients"])
async def search_patients(q: str = "", db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    patients = db.query(models.Patient).filter(
        (models.Patient.nom.ilike(f"%{q}%")) |
        (models.Patient.prenom.ilike(f"%{q}%")) |
        (models.Patient.code.ilike(f"%{q}%")) |
        (models.Patient.telephone.ilike(f"%{q}%"))
    ).limit(20).all()
    return [{"id": p.id, "code": p.code, "nom": p.nom, "prenom": p.prenom, "telephone": p.telephone, "email": p.email, "date_naissance": p.date_naissance, "sexe": p.sexe, "groupe_sanguin": p.groupe_sanguin} for p in patients]

@router.get("/patients/{patient_id}", tags=["Patients"])
async def get_patient(patient_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient non trouvé")
    return patient

@router.get("/admin/patients-list", tags=["Admin - Patients"])
async def list_patients(db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    patients = db.query(models.Patient).order_by(models.Patient.created_at.desc()).all()
    return [{"id": p.id, "code": p.code, "nom": p.nom, "prenom": p.prenom, "telephone": p.telephone, "email": p.email, "created_at": p.created_at} for p in patients]

# ══════════════════════════════════════════════════════════════════════════════
# CAISSIER — Endpoints accessibles au caissier
# ══════════════════════════════════════════════════════════════════════════════
@router.post("/caissier/mouvements", status_code=201, tags=["Caissier"])
async def caissier_create_mouvement(data: schemas.MouvementCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    m = models.Mouvement(**data.model_dump(), created_by=current_user.id)
    db.add(m)
    db.commit()
    db.refresh(m)
    return m

@router.get("/caissier/mouvements", tags=["Caissier"])
async def caissier_list_mouvements(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    debut = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    mouvements = db.query(models.Mouvement).filter(models.Mouvement.date_mouvement >= debut).order_by(models.Mouvement.date_mouvement.desc()).all()
    return mouvements
