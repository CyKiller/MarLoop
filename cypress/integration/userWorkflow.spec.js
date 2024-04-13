describe('User Workflow', () => {
  it('Allows a user to register, login, create a book project, and export it', () => {
    cy.visit('/auth/register');
    cy.get('input[name="username"]').type('testuser');
    cy.get('input[name="password"]').type('password');
    cy.get('form').submit();

    cy.get('a[href="/auth/login"]').click();
    cy.get('input[name="username"]').type('testuser');
    cy.get('input[name="password"]').type('password');
    cy.get('form').submit();

    cy.get('button#createBookProject').click();
    cy.get('input[name="title"]').type('My New Book');
    cy.get('form#bookProjectForm').submit();

    cy.get('button#exportBook').click();
  });
});