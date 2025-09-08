import React from 'react'
import AddUser from './AddUser'

describe('<AddUser />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<AddUser />)
  })
})