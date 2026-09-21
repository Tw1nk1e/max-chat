import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Modal from './Modal'

function renderModal(onClose = () => {}, open = true) {
  return render(
    <>
      <button>opener</button>
      <Modal open={open} title="Новый чат" onClose={onClose}>
        <input aria-label="Поле" data-autofocus />
        <button>Готово</button>
      </Modal>
    </>,
  )
}

describe('Modal', () => {
  it('renders an accessible dialog with a title', () => {
    renderModal()

    expect(screen.getByRole('dialog', { name: 'Новый чат' })).toHaveAttribute('aria-modal', 'true')
  })

  it('renders nothing when closed', () => {
    renderModal(() => {}, false)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('focuses the field marked for autofocus', () => {
    renderModal()

    expect(screen.getByLabelText('Поле')).toHaveFocus()
  })

  it('closes on Escape, on the close button and on a click outside', async () => {
    const onClose = vi.fn()
    renderModal(onClose)

    await userEvent.keyboard('{Escape}')
    await userEvent.click(screen.getByRole('button', { name: 'Закрыть' }))
    await userEvent.pointer({
      target: screen.getByRole('dialog').parentElement as HTMLElement,
      keys: '[MouseLeft]',
    })

    expect(onClose).toHaveBeenCalledTimes(3)
  })

  it('does not close when clicking inside the dialog', async () => {
    const onClose = vi.fn()
    renderModal(onClose)

    await userEvent.click(screen.getByLabelText('Поле'))

    expect(onClose).not.toHaveBeenCalled()
  })

  it('keeps Tab focus inside the dialog', async () => {
    renderModal()

    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Готово' })).toHaveFocus()

    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Закрыть' })).toHaveFocus()

    await userEvent.tab({ shift: true })
    expect(screen.getByRole('button', { name: 'Готово' })).toHaveFocus()
  })

  it('returns focus to the element that opened it', () => {
    const { rerender } = render(
      <>
        <button>opener</button>
        <Modal open={false} title="Новый чат" onClose={() => {}}>
          <input aria-label="Поле" data-autofocus />
        </Modal>
      </>,
    )
    screen.getByText('opener').focus()

    rerender(
      <>
        <button>opener</button>
        <Modal open title="Новый чат" onClose={() => {}}>
          <input aria-label="Поле" data-autofocus />
        </Modal>
      </>,
    )
    expect(screen.getByLabelText('Поле')).toHaveFocus()

    rerender(
      <>
        <button>opener</button>
        <Modal open={false} title="Новый чат" onClose={() => {}}>
          <input aria-label="Поле" data-autofocus />
        </Modal>
      </>,
    )
    expect(screen.getByText('opener')).toHaveFocus()
  })
})
