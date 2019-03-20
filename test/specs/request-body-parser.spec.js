"use strict";

const createMiddleware = require("../../");
const { assert, expect } = require("chai");
const fixtures = require("../utils/fixtures");
const { helper } = require("../utils");
const fs = require("fs");

describe("RequestBodyParser middleware", () => {

  describe("method signatures", () => {
    it("can be called without any params", (done) => {
      createMiddleware(fixtures.data.petStore, (err, middleware) => {
        let express = helper.express(middleware.parseRequest());

        helper.supertest(express)
          .post("/foo")
          .set("Content-Type", "application/json; charset=utf-8")
          .send(JSON.stringify({ foo: "bar" }))
          .end(helper.checkSpyResults(done));

        express.post("/foo", helper.spy((req, res, next) => {
          expect(req.body).to.deep.equal({ foo: "bar" });
        }));
      });
    });

    it("can be called with just an Express app", (done) => {
      createMiddleware(fixtures.data.petStore, (err, middleware) => {
        let express = helper.express();
        express.use(middleware.parseRequest(express));

        helper.supertest(express)
          .post("/foo")
          .set("Content-Type", "application/json; charset=utf-8")
          .send(JSON.stringify({ foo: "bar" }))
          .end(helper.checkSpyResults(done));

        express.post("/foo", helper.spy((req, res, next) => {
          expect(req.body).to.deep.equal({ foo: "bar" });
        }));
      });
    });

    it("can be called with just routing options", (done) => {
      createMiddleware(fixtures.data.petStore, (err, middleware) => {
        let express = helper.express(middleware.parseRequest({ caseSensitive: true }));

        helper.supertest(express)
          .post("/foo")
          .set("Content-Type", "application/json; charset=utf-8")
          .send(JSON.stringify({ foo: "bar" }))
          .end(helper.checkSpyResults(done));

        express.post("/foo", helper.spy((req, res, next) => {
          expect(req.body).to.deep.equal({ foo: "bar" });
        }));
      });
    });

    it("can be called with just options", (done) => {
      createMiddleware(fixtures.data.petStore, (err, middleware) => {
        let express = helper.express(middleware.parseRequest({ json: { type: "foo/bar" }}));

        helper.supertest(express)
          .post("/foo")
          .set("Content-Type", "foo/bar; charset=utf-8")
          .send(JSON.stringify({ foo: "bar" }))
          .end(helper.checkSpyResults(done));

        express.post("/foo", helper.spy((req, res, next) => {
          expect(req.body).to.deep.equal({ foo: "bar" });
        }));
      });
    });

    it("can be called with an Express app and options", (done) => {
      createMiddleware(fixtures.data.petStore, (err, middleware) => {
        let express = helper.express();
        express.use(middleware.parseRequest(express, { json: { type: "foo/bar" }}));

        helper.supertest(express)
          .post("/foo")
          .set("Content-Type", "foo/bar; charset=utf-8")
          .send(JSON.stringify({ foo: "bar" }))
          .end(helper.checkSpyResults(done));

        express.post("/foo", helper.spy((req, res, next) => {
          expect(req.body).to.deep.equal({ foo: "bar" });
        }));
      });
    });

    it("can be called with a routing options and options", (done) => {
      createMiddleware(fixtures.data.petStore, (err, middleware) => {
        let express = helper.express(middleware.parseRequest({ caseSensitive: true }, { json: { type: "foo/bar" }}));

        helper.supertest(express)
          .post("/foo")
          .set("Content-Type", "foo/bar; charset=utf-8")
          .send(JSON.stringify({ foo: "bar" }))
          .end(helper.checkSpyResults(done));

        express.post("/foo", helper.spy((req, res, next) => {
          expect(req.body).to.deep.equal({ foo: "bar" });
        }));
      });
    });
  });

  describe("JSON parser", () => {
    it("should parse application/json", (done) => {
      createMiddleware(fixtures.data.petStore, (err, middleware) => {
        let express = helper.express(middleware.parseRequest());
        let data = { foo: "bar", biz: 42, baz: ["A", "b", 3]};

        helper.supertest(express)
          .post("/foo")
          .set("Content-Type", "application/json; charset=utf-8")
          .send(JSON.stringify(data))
          .end(helper.checkSpyResults(done));

        express.post("/foo", helper.spy((req, res, next) => {
          expect(req.body).to.deep.equal(data);
        }));
      });
    });

    it("should parse text/json", (done) => {
      createMiddleware(fixtures.data.petStore, (err, middleware) => {
        let express = helper.express(middleware.parseRequest());
        let data = { foo: "bar", biz: 42, baz: ["A", "b", 3]};

        helper.supertest(express)
          .post("/foo")
          .set("Content-Type", "text/json")
          .send(JSON.stringify(data))
          .end(helper.checkSpyResults(done));

        express.post("/foo", helper.spy((req, res, next) => {
          expect(req.body).to.deep.equal(data);
        }));
      });
    });

    it("should parse application/calendar+json", (done) => {
      createMiddleware(fixtures.data.petStore, (err, middleware) => {
        let express = helper.express(middleware.parseRequest());
        let data = { foo: "bar", biz: 42, baz: ["A", "b", 3]};

        helper.supertest(express)
          .post("/foo")
          .set("Content-Type", "application/calendar+json")
          .send(JSON.stringify(data))
          .end(helper.checkSpyResults(done));

        express.post("/foo", helper.spy((req, res, next) => {
          expect(req.body).to.deep.equal(data);
        }));
      });
    });

    it("can be modified to accept other content types", (done) => {
      createMiddleware(fixtures.data.petStore, (err, middleware) => {
        let express = helper.express(middleware.parseRequest({
          json: { type: "foo/bar" }
        }));
        let data = { foo: "bar", biz: 42, baz: ["A", "b", 3]};

        helper.supertest(express)
          .post("/foo")
          .set("Content-Type", "foo/bar")
          .send(JSON.stringify(data))
          .end(helper.checkSpyResults(done));

        express.post("/foo", helper.spy((req, res, next) => {
          expect(req.body).to.deep.equal(data);
        }));
      });
    });

    it("should throw an error if the JSON is malformed", (done) => {
      createMiddleware(fixtures.data.petStore, (err, middleware) => {
        let express = helper.express(middleware.parseRequest());

        helper.supertest(express)
          .post("/foo")
          .set("Content-Type", "application/json; charset=utf-8")
          .send('{"foo":"bar",not valid JSON')
          .end(helper.checkSpyResults(done));

        express.post("/foo", helper.spy((req, res, next) => {
          assert(false, "This middleware should NOT get called");
        }));

        express.use("/foo", helper.spy((err, req, res, next) => {
          expect(err).to.be.an.instanceOf(SyntaxError);
          expect(err.status).to.equal(400);
          expect(err.body).to.equal('{"foo":"bar",not valid JSON');
        }));
      });
    });
  });

  describe("Text parser", () => {
    it("should parse text/plain", (done) => {
      createMiddleware(fixtures.data.petStore, (err, middleware) => {
        let express = helper.express(middleware.parseRequest());

        helper.supertest(express)
          .post("/foo")
          .set("Content-Type", "text/plain")
          .send("hello world")
          .end(helper.checkSpyResults(done));

        express.post("/foo", helper.spy((req, res, next) => {
          expect(req.body).to.equal("hello world");
        }));
      });
    });

    it("should parse text/css", (done) => {
      createMiddleware(fixtures.data.petStore, (err, middleware) => {
        let express = helper.express(middleware.parseRequest());

        helper.supertest(express)
          .post("/foo")
          .set("Content-Type", "text/css")
          .send("body: {color: blue;}")
          .end(helper.checkSpyResults(done));

        express.post("/foo", helper.spy((req, res, next) => {
          expect(req.body).to.equal("body: {color: blue;}");
        }));
      });
    });

    it("should parse text/xml", (done) => {
      createMiddleware(fixtures.data.petStore, (err, middleware) => {
        let express = helper.express(middleware.parseRequest());

        helper.supertest(express)
          .post("/foo")
          .set("Content-Type", "text/xml")
          .send('<root><thing id="foo">bar</thing></root>')
          .end(helper.checkSpyResults(done));

        express.post("/foo", helper.spy((req, res, next) => {
          expect(req.body).to.equal('<root><thing id="foo">bar</thing></root>');
        }));
      });
    });

    it("can be modified to accept other content types", (done) => {
      createMiddleware(fixtures.data.petStore, (err, middleware) => {
        let express = helper.express(middleware.parseRequest({
          text: { type: "foo/bar" }
        }));

        helper.supertest(express)
          .post("/foo")
          .set("Content-Type", "foo/bar")
          .send("hello world")
          .end(helper.checkSpyResults(done));

        express.post("/foo", helper.spy((req, res, next) => {
          expect(req.body).to.equal("hello world");
        }));
      });
    });
  });

  describe("URL-encoded parser", () => {
    it("should parse encoded data", (done) => {
      createMiddleware(fixtures.data.petStore, (err, middleware) => {
        let express = helper.express(middleware.parseRequest());

        helper.supertest(express)
          .post("/foo")
          .set("Content-Type", "application/x-www-form-urlencoded")
          .send("foo=bar&biz=42&biz=43&biz=44&baz[5]=A&baz[0]=B&baz[2]=C&bob[name]=bob&bob[age]=42")
          .end(helper.checkSpyResults(done));

        express.post("/foo", helper.spy((req, res, next) => {
          expect(req.body).to.deep.equal({
            foo: "bar",
            biz: ["42", "43", "44"],
            baz: ["B", "C", "A"],
            bob: {
              name: "bob",
              age: "42"
            }
          });
        }));
      });
    });

    it("can be modified to accept other content types", (done) => {
      createMiddleware(fixtures.data.petStore, (err, middleware) => {
        let express = helper.express(middleware.parseRequest({
          urlencoded: { type: "foo/bar" }
        }));

        helper.supertest(express)
          .post("/foo")
          .set("Content-Type", "foo/bar")
          .send("foo=bar&biz=42&biz=43&biz=44&baz[5]=A&baz[0]=B&baz[2]=C&bob[name]=bob&bob[age]=42")
          .end(helper.checkSpyResults(done));

        express.post("/foo", helper.spy((req, res, next) => {
          expect(req.body).to.deep.equal({
            foo: "bar",
            biz: ["42", "43", "44"],
            baz: ["B", "C", "A"],
            bob: {
              name: "bob",
              age: "42"
            }
          });
        }));
      });
    });

    it("should not throw an error if the data is malformed", (done) => {
      createMiddleware(fixtures.data.petStore, (err, middleware) => {
        let express = helper.express(middleware.parseRequest());

        helper.supertest(express)
          .post("/foo")
          .set("Content-Type", "application/x-www-form-urlencoded")
          .send("foo&bar===&&&=&++&&==baz")
          .end(helper.checkSpyResults(done));

        express.post("/foo", helper.spy((req, res, next) => {
          expect(req.body).to.deep.equal({
            "  ": "",
            bar: "==",
            foo: ""
          });
        }));
      });
    });

  });

  describe("Raw parser", () => {
    it("should parse plain text as a Buffer", (done) => {
      createMiddleware(fixtures.data.petStore, (err, middleware) => {
        let express = helper.express(middleware.parseRequest());

        helper.supertest(express)
          .post("/foo")
          .set("Content-Type", "application/octet-stream")
          .send("hello world")
          .end(helper.checkSpyResults(done));

        express.post("/foo", helper.spy((req, res, next) => {
          expect(req.body).to.be.an.instanceOf(Buffer);
          expect(req.body.toString()).to.equal("hello world");
        }));
      });
    });

    it("should parse binary data as a Buffer", (done) => {
      createMiddleware(fixtures.data.petStore, (err, middleware) => {
        let express = helper.express(middleware.parseRequest());
        let buffer = fs.readFileSync(fixtures.paths.oneMB);

        helper.supertest(express)
          .post("/foo")
          .set("Content-Type", "application/octet-stream")
          .set("Content-Length", buffer.length)
          .send(buffer)
          .end(helper.checkSpyResults(done));

        express.post("/foo", helper.spy((req, res, next) => {
          expect(req.body).to.deep.equal(buffer);
        }));
      });
    });

    it("should parse application/xml as a Buffer", (done) => {
      createMiddleware(fixtures.data.petStore, (err, middleware) => {
        let express = helper.express(middleware.parseRequest());

        helper.supertest(express)
          .post("/foo")
          .set("Content-Type", "application/xml")
          .send('<root><thing id="foo">bar</thing></root>')
          .end(helper.checkSpyResults(done));

        express.post("/foo", helper.spy((req, res, next) => {
          expect(req.body).to.be.an.instanceOf(Buffer);
          expect(req.body.toString()).to.equal('<root><thing id="foo">bar</thing></root>');
        }));
      });
    });

    it("should parse application/soap+xml as a Buffer", (done) => {
      createMiddleware(fixtures.data.petStore, (err, middleware) => {
        let express = helper.express(middleware.parseRequest());

        helper.supertest(express)
          .post("/foo")
          .set("Content-Type", "application/soap+xml")
          .send('<envelope><message id="foo">bar</message></envelope>')
          .end(helper.checkSpyResults(done));

        express.post("/foo", helper.spy((req, res, next) => {
          expect(req.body).to.be.an.instanceOf(Buffer);
          expect(req.body.toString()).to.equal('<envelope><message id="foo">bar</message></envelope>');
        }));
      });
    });

    it("should support large files (up to 5MB) by default", (done) => {
      createMiddleware(fixtures.data.petStore, (err, middleware) => {
        let express = helper.express(middleware.parseRequest());
        let buffer = fs.readFileSync(fixtures.paths.fiveMB);

        helper.supertest(express)
          .post("/foo")
          .set("Content-Type", "application/octet-stream")
          .set("Content-Length", buffer.length)
          .send(buffer)
          .end(helper.checkSpyResults(done));

        express.post("/foo", helper.spy((req, res, next) => {
          let MB = 1024 * 1024;
          expect(req.body.length).to.be.above(4 * MB).and.below(5 * MB);
          expect(req.body).to.deep.equal(buffer);
        }));
      });
    });

    it("should not support files larger than 5MB by default", (done) => {
      createMiddleware(fixtures.data.petStore, (err, middleware) => {
        let express = helper.express(middleware.parseRequest());
        let buffer = fs.readFileSync(fixtures.paths.sixMB);

        helper.supertest(express)
          .post("/foo")
          .set("Content-Type", "application/octet-stream")
          .set("Content-Length", buffer.length)
          .send(buffer)
          .end(helper.checkSpyResults(done));

        express.post("/foo", helper.spy((req, res, next) => {
          assert(false, "This middleware should not get called");
        }));

        express.use("/foo", helper.spy((err, req, res, next) => {
          expect(err).to.be.an.instanceOf(Error);
          expect(err.status).to.equal(413);
          expect(err.message).to.equal("request entity too large");
        }));
      });
    });

    it("should support files larger than 5MB if configured to", (done) => {
      createMiddleware(fixtures.data.petStore, (err, middleware) => {
        let express = helper.express(middleware.parseRequest({
          raw: { limit: "6mb" }
        }));
        let buffer = fs.readFileSync(fixtures.paths.sixMB);

        helper.supertest(express)
          .post("/foo")
          .set("Content-Type", "application/octet-stream")
          .set("Content-Length", buffer.length)
          .send(buffer)
          .end(helper.checkSpyResults(done));

        express.post("/foo", helper.spy((req, res, next) => {
          let MB = 1024 * 1024;
          expect(req.body.length).to.be.above(5 * MB).and.below(6 * MB);
          expect(req.body).to.deep.equal(buffer);
        }));
      });
    });

    it("can be modified to accept other content types", (done) => {
      createMiddleware(fixtures.data.petStore, (err, middleware) => {
        let express = helper.express(middleware.parseRequest({
          raw: { type: "foo/bar" }
        }));

        helper.supertest(express)
          .post("/foo")
          .set("Content-Type", "foo/bar")
          .send("hello world")
          .end(helper.checkSpyResults(done));

        express.post("/foo", helper.spy((req, res, next) => {
          expect(req.body).to.be.an.instanceOf(Buffer);
          expect(req.body.toString()).to.equal("hello world");
        }));
      });
    });
  });

  describe("Multipart form data parser", () => {
    it("should parse simple fields", (done) => {
      createMiddleware(fixtures.data.petStore, (err, middleware) => {
        let express = helper.express(middleware.parseRequest());

        helper.supertest(express)
          .post("/foo")
          .set("Content-Type", "multipart/form-data")
          .field("foo", "bar")
          .field("biz", "42")
          .field("biz", "43")
          .field("biz", "44")
          .field("baz[5]", "A")
          .field("baz[0]", "B")
          .field("baz[2]", "C")
          .field("bob[name]", "bob")
          .field("bob[age]", "42")
          .end(helper.checkSpyResults(done));

        express.post("/foo", helper.spy((req, res, next) => {
          expect(req.body).to.deep.equal({
            foo: "bar",
            biz: ["42", "43", "44"],
            baz: ["B", undefined, "C", undefined, undefined, "A"],
            bob: {
              name: "bob",
              age: "42"
            }
          });
        }));
      });
    });

    it("should parse file attachments", (done) => {
      createMiddleware(fixtures.data.petStore, (err, middleware) => {
        let express = helper.express(middleware.parseRequest());

        helper.supertest(express)
          .post("/foo")
          .set("Content-Type", "multipart/form-data")
          .attach("file1", fixtures.paths.oneMB, "1MB.jpg")
          .attach("file2", fixtures.paths.oneMB, "MyFile.foobar")
          .end(helper.checkSpyResults(done));

        express.post("/foo", helper.spy((req, res, next) => {
          expect(req.body).to.deep.equal({});
          expect(req.files).to.deep.equal({
            file1: [{
              encoding: "7bit",
              fieldname: "file1",
              mimetype: "image/jpeg",
              filename: req.files.file1[0].filename,
              originalname: "1MB.jpg",
              path: req.files.file1[0].path,
              destination: req.files.file1[0].destination,
              size: 683709,
            }],
            file2: [{
              encoding: "7bit",
              fieldname: "file2",
              mimetype: "image/jpeg",
              filename: req.files.file2[0].filename,
              originalname: "MyFile.foobar",
              path: req.files.file2[0].path,
              destination: req.files.file2[0].destination,
              size: 683709,
            }]
          });
        }));
      });
    });

    it("should parse a mix of fields and file attachments", (done) => {
      createMiddleware(fixtures.data.petStore, (err, middleware) => {
        let express = helper.express(middleware.parseRequest());

        helper.supertest(express)
          .post("/foo")
          .set("Content-Type", "multipart/form-data")
          .attach("file1", fixtures.paths.oneMB, "1MB.jpg")
          .field("foo", "bar")
          .attach("file2", fixtures.paths.oneMB, "MyFile.foobar")
          .field("biz", "42")
          .end(helper.checkSpyResults(done));

        express.post("/foo", helper.spy((req, res, next) => {
          expect(req.body).to.deep.equal({
            foo: "bar",
            biz: "42"
          });
          expect(req.files).to.deep.equal({
            file1: [{
              encoding: "7bit",
              fieldname: "file1",
              mimetype: "image/jpeg",
              filename: req.files.file1[0].filename,
              originalname: "1MB.jpg",
              path: req.files.file1[0].path,
              destination: req.files.file1[0].destination,
              size: 683709,
            }],
            file2: [{
              encoding: "7bit",
              fieldname: "file2",
              mimetype: "image/jpeg",
              filename: req.files.file2[0].filename,
              originalname: "MyFile.foobar",
              path: req.files.file2[0].path,
              destination: req.files.file2[0].destination,
              size: 683709,
            }]
          });
        }));
      });
    });

    it("should support large file attachments by default", (done) => {
      createMiddleware(fixtures.data.petStore, (err, middleware) => {
        let express = helper.express(middleware.parseRequest());

        helper.supertest(express)
          .post("/foo")
          .set("Content-Type", "multipart/form-data")
          .attach("file1", fixtures.paths.oneMB, "1MB.jpg")
          .attach("file2", fixtures.paths.fiveMB, "5MB.jpg")
          .attach("file3", fixtures.paths.sixMB, "6MB.jpg")
          .end(helper.checkSpyResults(done));

        express.post("/foo", helper.spy((req, res, next) => {
          expect(req.body).to.deep.equal({});
          expect(req.files).to.deep.equal({
            file1: [{
              encoding: "7bit",
              fieldname: "file1",
              mimetype: "image/jpeg",
              filename: req.files.file1[0].filename,
              originalname: "1MB.jpg",
              path: req.files.file1[0].path,
              destination: req.files.file1[0].destination,
              size: 683709,
            }],
            file2: [{
              encoding: "7bit",
              fieldname: "file2",
              mimetype: "image/jpeg",
              filename: req.files.file2[0].filename,
              originalname: "5MB.jpg",
              path: req.files.file2[0].path,
              destination: req.files.file2[0].destination,
              size: 4573123,
            }],
            file3: [{
              encoding: "7bit",
              fieldname: "file3",
              mimetype: "image/jpeg",
              filename: req.files.file3[0].filename,
              originalname: "6MB.jpg",
              path: req.files.file3[0].path,
              destination: req.files.file3[0].destination,
              size: 5595095,
            }]
          });
        }));
      });
    });
  });
});