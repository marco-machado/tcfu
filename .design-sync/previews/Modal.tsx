import { Modal, Button } from 'tcfu'

const frame = { position: 'relative', width: 520, height: 300, overflow: 'hidden' } as const

export function Confirm() {
  return (
    <div style={frame}>
      <Modal title="Abandon run?" sub="Salvage collected this sortie will be lost.">
        <div className="modal-actions">
          <Button variant="danger">Abandon</Button>
          <Button variant="ghost">Keep flying</Button>
        </div>
      </Modal>
    </div>
  )
}

export function DeathModal() {
  return (
    <div style={frame}>
      <Modal
        overlayTone="death"
        tone="danger"
        title="Hull lost"
        sub="Wave 14 // 61,200 points // 980 scrap recovered"
      >
        <div className="modal-actions">
          <Button variant="primary" icon="launch">
            Relaunch
          </Button>
          <Button variant="secondary" icon="back">
            Hangar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
