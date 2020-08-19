const request = require("supertest");
const app = require("../app");
const { isUuid } = require("uuidv4");


describe("Repositories", () => {
  it("should be able to create a new repository", async () => {
    const response = await request(app)
      .post("/repositories")
      .send({
        url: "https://github.com/vinieloy/app-redis-repositories",
        title: "Redis",
        techs: ["Docker", "Javascript", "Redis"]
      });

    expect(isUuid(response.body.id)).toBe(true);

    expect(response.body).toMatchObject({
      url: "https://github.com/vinieloy/app-redis-repositories",
      title: "Redis",
      techs: ["Docker", "Javascript", "Redis"],
      likes: 0
    });
  });


  it("should be able to list the repositories", async () => {
    const repository = await request(app)
      .post("/repositories")
      .send({
        url: "https://github.com/vinieloy/app-redis-repositories",
        title: "Redis",
        techs: ["Docker", "Javascript", "Redis"]
      });

    const response = await request(app).get("/repositories");

    expect(response.body).toEqual(
      expect.arrayContaining([
        {
          id: repository.body.id,
          url: "https://github.com/vinieloy/app-redis-repositories",
          title: "Redis",
          techs: ["Docker", "Javascript", "Redis"],
          likes: 0
        }
      ])
    );
  });


  it("should be able to update repository", async () => {
    const repository = await request(app)
      .post("/repositories")
      .send({
        url: "https://github.com/vinieloy/app-redis-repositories",
        title: "Redis",
        techs: ["Docker", "Javascript", "Redis"]
      });

    const response = await request(app)
      .put(`/repositories/${repository.body.id}`)
      .send({
        url: "https://github.com/vinieloy/unform",
        title: "Unform",
        techs: ["React", "ReactNative", "TypeScript", "ContextApi"]
      });

    expect(isUuid(response.body.id)).toBe(true);

    expect(response.body).toMatchObject({
      url: "https://github.com/vinieloy/unform",
      title: "Unform",
      techs: ["React", "ReactNative", "TypeScript", "ContextApi"]
    });
  });


  it("should not be able to update a repository that does not exist", async () => {
    await request(app).put(`/repositories/123`).expect(400);
  });


  it("should not be able to update repository likes manually", async () => {
    const repository = await request(app)
      .post("/repositories")
      .send({
        url: "https://github.com/vinieloy/app-redis-repositories",
        title: "Redis",
        techs: ["Docker", "Javascript", "Redis"]
      });

    const response = await request(app)
      .put(`/repositories/${repository.body.id}`)
      .send({
        likes: 15
      });

    expect(response.body).toMatchObject({
      likes: 0
    });
  });


  it("should be able to delete the repository", async () => {
    const response = await request(app)
      .post("/repositories")
      .send({
        url: "https://github.com/vinieloy/umbriel",
        title: "Umbriel",
        techs: ["Node", "Express", "TypeScript"]
      });

    await request(app).delete(`/repositories/${response.body.id}`).expect(204);

    const repositories = await request(app).get("/repositories");

    const repository = repositories.body.find((r) => r.id === response.body.id);

    expect(repository).toBe(undefined);
  });


  it("should not be able to delete a repository that does not exist", async () => {
    await request(app).delete(`/repositories/123`).expect(400);
  });


  it("should be able to give a like to the repository", async () => {
    const repository = await request(app)
      .post("/repositories")
      .send({
        url: "https://github.com/vinieloy/app-redis-repositories",
        title: "Redis",
        techs: ["Docker", "Javascript", "Redis"]
      });
    
    expect(isUuid(repository.body.id)).toBe(true);

    const response = await request(app)
      .post(`/repositories/${repository.body.id}/like`);

    expect(response.body).toMatchObject({
      likes: 1
    });
  });


  it("should not be able to like a repository that does not exist", async () => {
    await request(app).post(`/repositories/123/like`).expect(400);
  });
});
