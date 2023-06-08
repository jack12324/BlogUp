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

  it("Login form is shown", () => {
    cy.contains("login");
  });

  describe("Login", () => {
    beforeEach(() => {});
    it("succeeds with correct credentials", () => {
      cy.contains("login").click();
      cy.get("#username").type("test_user");
      cy.get("#password").type("test");
      cy.get("#login-form-submit").click();
      cy.contains("Test User is logged in");
    });
    it("fails with wrong credentials", () => {
      cy.contains("login").click();
      cy.get("#username").type("test_user");
      cy.get("#password").type("wrong");
      cy.get("#login-form-submit").click();
      cy.get(".error")
        .should("contain", "Wrong Username or Password")
        .and("have.css", "color", "rgb(255, 0, 0)")
        .and("have.css", "border-style", "solid");
      cy.get("html").should("not.contain", "Test User is logged in");
    });
  });

  describe("When logged in", () => {
    beforeEach(() => {
      cy.login({ username: "test_user", password: "test" });
    });
    it("A blog can be created", () => {
      cy.contains("Add a blog").click();
      cy.get("#title").type("a cypress test exercise");
      cy.get("#author").type("jack porter");
      cy.get("#url").type("test.com");
      cy.get("#blog-form-submit-button").click();
      cy.contains("a cypress test exercise jack porter");
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
        cy.contains("test blog 1").click();
        cy.get(".likes").as("likesp");
        cy.get("@likesp").contains("0");
        cy.get("@likesp").contains("like").click();
        cy.get("@likesp").contains("1");
      });
      it("the user can delete one of their blogs", () => {
        cy.contains("test blog 1").click();
        cy.get("#delete-blog-button").click();
        cy.wait(6000);
        cy.get("html").should("not.contain", "test blog 1");
      });
      it("the user can not see the remove button if they didn't create the note", () => {
        cy.contains("test blog 3").click();
        cy.get("#delete-blog-button").should("not.exist");
      });
      it("blogs are displayed according the the number of likes", () => {
        const sortedStartingItems = startingBlogs.toSorted(
          (a, b) => b.likes - a.likes
        );
        sortedStartingItems.forEach((blog, i) => {
          cy.get(".blog-item").eq(i).contains(blog.title);
        });
      });
    });
  });
});
