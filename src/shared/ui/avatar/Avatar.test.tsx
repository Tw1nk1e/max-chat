import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Avatar from './Avatar'

describe('Avatar', () => {
  it('renders the provided label', () => {
    render(<Avatar label="67" />)

    expect(screen.getByText('67')).toBeInTheDocument()
  })
})
