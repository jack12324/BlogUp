describe("Blog app", () => {
  beforeEach(() => {
    cy.request("POST", `${Cypress.env("BACKEND")}/testing/reset`);
    cy.request("POST", `${Cypress.env("BACKEND")}/users`, {
      username: "test_user",
      name: "Test User",
      password: "test",
    });
    cy.request("POST", `${Cypress.env("BACKEND")}/users`, {
      username: "other_user",
      name: "Test User 2",
      password: "test",
    });
    cy.visit("");
  });

  it("Login bar is shown", () => {
    cy.contains("Log In");
  });

  describe("Login", () => {
    beforeEach(() => {});
    it("succeeds with correct credentials", () => {
      cy.contains("Log In").click();
      cy.get("#username").type("test_user");
      cy.get("#password").type("test");
      cy.get("#login-form-submit").click();
      cy.contains("Welcome");
    });
    it("fails with wrong credentials", () => {
      cy.contains("Log In").click();
      cy.get("#username").type("test_user");
      cy.get("#password").type("wrong");
      cy.get("#login-form-submit").click();
      cy.get("[data-status=error]").should(
        "contain",
        "invalid username or password"
      );
    });
  });

  describe("When logged in", () => {
    beforeEach(() => {
      cy.login({ username: "test_user", password: "test" });
    });
    it("A blog can be created", () => {
      cy.contains("My Blogs").click();
      cy.get("[data-cy=add-blog]").click();
      cy.get("#title").type("a cypress test exercise");
      cy.get("#author").type("jack porter");
      cy.get("#url").type("test.com");
      cy.get("#blog-form-submit-button").click();
      cy.contains("a cypress test exercise");
    });

    const startingBlogs = [
      {
        title: "test blog 1",
        author: "Testy Joe",
        url: "test.com",
        likes: 0,
      },
      {
        title: "test blog 2",
        author: "Testy Pete",
        url: "testy.com",
        likes: 3,
      },
      {
        title: "test blog 3",
        author: "Testy Mike",
        url: "teste.com",
        likes: 5,
      },
    ];

    describe("And blogs exist", () => {
      beforeEach(() => {
        cy.createBlog(startingBlogs[0]);
        cy.createBlog(startingBlogs[1]);
        cy.login({ username: "other_user", password: "test" });
        cy.createBlog(startingBlogs[2]);
        cy.login({ username: "test_user", password: "test" });
      });
      it("the user can like a blog", () => {
        cy.get(`[data-cy="blog-${startingBlogs[0].title}"]`)
          .find("[data-cy=blog-like-button]")
          .as("likeb");
        cy.get(`[data-cy="blog-${startingBlogs[0].title}"]`)
          .find("[data-cy=blog-like-count]")
          .as("likec");
        cy.get("@likec").contains("0");
        cy.get("@likeb").click();
        cy.get("@likec").contains("1");
      });
      it("the user can delete one of their blogs", () => {
        cy.get(`[data-cy="blog-${startingBlogs[0].title}"]`)
          .find("[data-cy=blog-delete-button]")
          .click();
        cy.get(`[data-cy=alert-confirm-button]`).contains("Delete").click();
        cy.get(`[data-cy="blog-${startingBlogs[0].title}"]`).should(
          "not.exist"
        );
      });
      it("the user can not see the remove button if they didn't create the note", () => {
        cy.get(`[data-cy="blog-${startingBlogs[2].title}"]`)
          .find("[data-cy=blog-delete-button]")
          .should("not.exist");
      });
      it("blogs are displayed according the the number of likes", () => {
        const sortedStartingItems = [...startingBlogs].sort(
          (a, b) => b.likes - a.likes
        );
        sortedStartingItems.forEach((blog, i) => {
          cy.get("[data-cy=blog-title]").eq(i).contains(blog.title);
        });
      });
    });
  });
});
