const chai = require("chai");
const chaiHttp = require("chai-http");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

const puzzle =
  "1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.";

suite("Functional Tests", () => {
  suite("POST /api/solve", () => {
    test("Solve a puzzle with valid puzzle string", function (done) {
      chai
        .request(server)
        .post("/api/solve")
        .send({ puzzle })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, "solution");
          done();
        });
    });

    test("Solve a puzzle with missing puzzle string", function (done) {
      chai
        .request(server)
        .post("/api/solve")
        .send({})
        .end((err, res) => {
          assert.deepEqual(res.body, { error: "Required field missing" });
          done();
        });
    });

    test("Solve a puzzle with invalid characters", function (done) {
      const badPuzzle = puzzle.replace(".", "#");
      chai
        .request(server)
        .post("/api/solve")
        .send({ puzzle: badPuzzle })
        .end((err, res) => {
          assert.deepEqual(res.body, { error: "Invalid characters in puzzle" });
          done();
        });
    });

    test("Solve a puzzle with incorrect length", function (done) {
      const shortPuzzle = puzzle.slice(0, 60);
      chai
        .request(server)
        .post("/api/solve")
        .send({ puzzle: shortPuzzle })
        .end((err, res) => {
          assert.deepEqual(res.body, { error: "Expected puzzle to be 81 characters long" });
          done();
        });
    });

    test("Solve a puzzle that cannot be solved", function (done) {
      const unsolvablePuzzle = puzzle.replace(/1/, "9").replace(/2/, "9");
      chai
        .request(server)
        .post("/api/solve")
        .send({ puzzle: unsolvablePuzzle })
        .end((err, res) => {
          assert.deepEqual(res.body, { error: "Puzzle cannot be solved" });
          done();
        });
    });
  });

  suite("POST /api/check", () => {
    test("Check a puzzle placement with all fields", function (done) {
      chai
        .request(server)
        .post("/api/check")
        .send({ puzzle, coordinate: "A2", value: "3" })
        .end((err, res) => {
          assert.property(res.body, "valid");
          assert.isTrue(res.body.valid);
          done();
        });
    });

    test("Check a puzzle placement with single placement conflict", function (done) {
      chai
        .request(server)
        .post("/api/check")
        .send({ puzzle, coordinate: "A2", value: "2" })
        .end((err, res) => {
          assert.isFalse(res.body.valid);
          assert.include(res.body.conflict, "column");
          done();
        });
    });

    test("Check a puzzle placement with multiple placement conflicts", function (done) {
      chai
        .request(server)
        .post("/api/check")
        .send({ puzzle, coordinate: "A2", value: "6" }) 
        .end((err, res) => {
          assert.isFalse(res.body.valid);
          assert.includeMembers(res.body.conflict, ["row", "column"]);
          done();
        });
    });

    test("Check a puzzle placement with all placement conflicts", function (done) {
      chai
        .request(server)
        .post("/api/check")
        .send({ puzzle, coordinate: "B2", value: "3" })
        .end((err, res) => {
          assert.isFalse(res.body.valid);
          assert.includeMembers(res.body.conflict, ["row", "column", "region"]);
          done();
        });
    });

    test("Check a puzzle placement with missing required fields", function (done) {
      chai
        .request(server)
        .post("/api/check")
        .send({ coordinate: "A2", value: "5" })
        .end((err, res) => {
          assert.deepEqual(res.body, { error: "Required field(s) missing" });
          done();
        });
    });

    test("Check a puzzle placement with invalid characters", function (done) {
      const invalid = puzzle.replace(".", "X");
      chai
        .request(server)
        .post("/api/check")
        .send({ puzzle: invalid, coordinate: "A2", value: "5" })
        .end((err, res) => {
          assert.deepEqual(res.body, { error: "Invalid characters in puzzle" });
          done();
        });
    });

    test("Check a puzzle placement with incorrect length", function (done) {
      const short = puzzle.slice(0, 70);
      chai
        .request(server)
        .post("/api/check")
        .send({ puzzle: short, coordinate: "A2", value: "5" })
        .end((err, res) => {
          assert.deepEqual(res.body, { error: "Expected puzzle to be 81 characters long" });
          done();
        });
    });

    test("Check a puzzle placement with invalid placement coordinate", function (done) {
      chai
        .request(server)
        .post("/api/check")
        .send({ puzzle, coordinate: "Z9", value: "5" })
        .end((err, res) => {
          assert.deepEqual(res.body, { error: "Invalid coordinate" });
          done();
        });
    });

    test("Check a puzzle placement with invalid placement value", function (done) {
      chai
        .request(server)
        .post("/api/check")
        .send({ puzzle, coordinate: "A2", value: "X" })
        .end((err, res) => {
          assert.deepEqual(res.body, { error: "Invalid value" });
          done();
        });
    });
  });
});
