
# ─── Patient (fiche clinique) ─────────────────────────────────────────────────
class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, index=True)  # #RB-001
    nom = Column(String(255), nullable=False)
    prenom = Column(String(255))
    date_naissance = Column(String(20))
    sexe = Column(String(10))
    telephone = Column(String(50))
    email = Column(String(255))
    adresse = Column(String(500))
    groupe_sanguin = Column(String(10))
    allergies = Column(Text)
    antecedents = Column(Text)
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
