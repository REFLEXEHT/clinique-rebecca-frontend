# SignaturePad — Usage rapide

## Basique
```tsx
import SignaturePad from '@/components/ui/SignaturePad'

<SignaturePad onSign={(dataUrl) => setSignature(dataUrl)} />
```

## Complet
```tsx
<SignaturePad
  label="Signature du patient"
  required={true}
  width={460}
  height={160}
  strokeColor="#0f172a"
  strokeWidth={2.5}
  onSign={(dataUrl) => {
    if (dataUrl) {
      // dataUrl = "data:image/png;base64,..."
      // Envoyer au backend, afficher dans PDF, stocker en DB
      setSignaturePatient(dataUrl)
    }
  }}
/>
```

## Lecture seule (afficher signature existante)
```tsx
<SignaturePad
  label="Signature enregistrée"
  readOnly={true}
  initialValue={signatureFromDatabase}
  onSign={() => {}}
/>
```

## Dans un document imprimable
```tsx
// La signature s'affiche dans l'aperçu ET dans l'impression
{signatureDataUrl && (
  <img src={signatureDataUrl} alt="Signature" style={{ height: 80, border: '1px solid #e2e8f0', borderRadius: 8 }} />
)}
```

## Appareils compatibles
- 🖱️ Souris (desktop)
- 👆 Écran tactile (tablette, téléphone)
- ✏️ Stylet / Apple Pencil / S Pen
- 🖊️ Pad de signature Wacom / Topaz
