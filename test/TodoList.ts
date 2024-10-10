import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("TodoList Test", function () {
  //Reusable async method for deployment
  async function deployTodoListFix() {
    //Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const TodoList = await hre.ethers.getContractFactory("TodoList");
    const todoList = await TodoList.deploy();

    return { todoList, owner, otherAccount };
  }

  describe("deployment", () => {
    it("Should check if it deployed", async function () {
      const { todoList, owner } = await loadFixture(deployTodoListFix);

      expect(await todoList.owner()).to.equal(owner);
    });
    
      describe("Deployment", () => {
        it("Should check if contract is deployed by the owner", async function () {
          const { todoList, owner } = await loadFixture(deployTodoListFix);
    
          expect(await todoList.owner()).to.equal(owner.address);
        });
      });
    
      describe("Create Todo", () => {
        it("Should allow the owner to create a Todo List", async function () {
          const { todoList, owner } = await loadFixture(deployTodoListFix);
    
          const title = "Don't eat in my class";
          const description = "To defend my project";
    
          await todoList.connect(owner).createTodo(title, description);
    
          const [createdTitle, createdDescription, status] = await todoList.getTodo(0);
    
          expect(createdTitle).to.equal(title);
          expect(createdDescription).to.equal(description);
          expect(status).to.equal(1); // Status.Created is enum index 1
        });
    
        it("Should not allow if you're the owner to create a Todo List", async function () {
          const { todoList, otherAccount } = await loadFixture(deployTodoListFix);
    
          const title = "Assignment";
          const description = "This Assignment want to kill me";
    
          await expect(
            todoList.connect(otherAccount).createTodo(title, description)
          ).to.be.revertedWith("You're not allowed");
        });
      });
    
      describe("Update Todo List", () => {
        it("Should allow owner to update a Todo List", async function () {
          const { todoList, owner } = await loadFixture(deployTodoListFix);
    
          await todoList.connect(owner).createTodo("Old title", "Old description");
    
          const newTitle = "Updated title";
          const newDescription = "Updated description";
          await todoList.connect(owner).updateTodo(0, newTitle, newDescription);
    
          const [updatedTitle, updatedDescription, status] = await todoList.getTodo(0);
    
          expect(updatedTitle).to.equal(newTitle);
          expect(updatedDescription).to.equal(newDescription);
          expect(status).to.equal(2); 
        });
    
        it("Should revert if trying to update a non-existing todo", async function () {
          const { todoList, owner } = await loadFixture(deployTodoListFix);
    
          await expect(
            todoList.connect(owner).updateTodo(0, "New title", "New description")
          ).to.be.revertedWith("Index is out-of-bound");
        });
      });
    
      describe("Complete Todo", () => {
        it("Should allow the owner to mark a todo as done", async function () {
          const { todoList, owner } = await loadFixture(deployTodoListFix);
    
          await todoList.connect(owner).createTodo("Title", "Description");
    
          await todoList.connect(owner).todoCompleted(0);
    
          const [, , status] = await todoList.getTodo(0);
          expect(status).to.equal(3); 
        });
      });
    
      describe("Delete Todo", () => {
        it("Should allow owner to delete a todo", async function () {
          const { todoList, owner } = await loadFixture(deployTodoListFix);
    
          await todoList.connect(owner).createTodo("Title", "Description");
    
          
          await todoList.connect(owner).deleteTodo(0);
    
          const allTodos = await todoList.getAllTodo();
          expect(allTodos.length).to.equal(0);
        });
    
        it("Should revert if trying to delete a non-existing todo", async function () {
          const { todoList, owner } = await loadFixture(deployTodoListFix);
    
          await expect(todoList.connect(owner).deleteTodo(0)).to.be.revertedWith("Index is out-of-bound");
        });
      });
    });
    
    it("Should be able to create list as the owner", async function () {
      const { todoList, owner } = await loadFixture(deployTodoListFix);
      const title = "Don't eat in my class";
      const description = "To defend my project";
      await todoList.connect(owner).createTodo(title, description);

      const index = 0;
      const allTodos = await todoList.getAllTodo();
      const currentTodo = allTodos[index];

      const [currentTitle, currentDescription] = currentTodo;

      expect(currentTitle).to.equal(title);
      expect(currentDescription).to.equal(description);
    });
  });
