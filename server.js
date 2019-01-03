const fastify = require("fastify");
const Next = require("next");

const { PORT = 3000, HOST = "0.0.0.0" } = process.env;
const dev = process.env.NODE_ENV !== "production";
// const ssrCache = new LRUCache({ maxAge: 0 }); // never expires
// const getCacheKey = req => `${req.url}`;

const getRoute = value => {
  return typeof value === "string" ? { page: value } : value;
};

const getRoutes = async app => {
  const {
    exportPathMap,
    routes = {},
    useExportRoutes = false
  } = app.nextConfig;

  if (!dev && useExportRoutes && exportPathMap) {
    console.log("Defining routes from exportPathMap");
    const exportRoutes = await exportPathMap({});
    return { ...routes, ...exportRoutes };
  }

  return routes;
};

const fridge = () => {
  const fastify = require("fastify")({ logger: { level: "error" } });

  if (!dev) {
    require("compression")({ threshold: 0 });
  }

  fastify.register(async (fastify, opts, next) => {
    try {
      const app = Next({ dev });
      const handle = app.getRequestHandler();
      await app.prepare();

      if (dev) {
        fastify.get("/_next/*", async (req, reply) => {
          await handle(req.req, reply.res);
          reply.sent = true;
        });
      }

      const routes = await getRoutes(app);
      for (const path in routes) {
        const { page, query = {} } = getRoute(routes[path]);

        fastify.get(path, async (req, reply) => {
          await app.render(req.req, reply.res, page, {
            ...req.params,
            ...req.query,
            ...query
          });
          reply.sent = true;
        });
      }

      fastify.get("/*", async (req, reply) => {
        await handle(req.req, reply.res);
        reply.sent = true;
      });

      fastify.setNotFoundHandler(async (req, reply) => {
        await app.render404(req.req, reply.res);
        reply.sent = true;
      });

      fastify.post("/_update", (req, reply) => {
        ssrCache.reset();
        reply.statusCode = 200;
        return "";
      });

      next();
    } catch (err) {
      next(err);
    }
  });

  // const renderWithCache = async (req, res, pathname, query, parsedUrl) => {
  //   if (isInternalUrl(req.url)) {
  //     return app.handleRequest(req, res, parsedUrl);
  //   }

  //   if (blockedPages[pathname]) {
  //     return await app.render404(req, res, parsedUrl);
  //   }

  //   const key = getCacheKey(req);

  //   try {
  //     let html = !dev && ssrCache.has(key) ? ssrCache.get(key) : null;

  //     if (!html) {
  //       html = await app.renderToHTML(req, res, pathname, query);
  //       ssrCache.set(key, html);
  //     }

  //     return sendHTML(req, res, html, req.method, app.renderOpts);
  //   } catch (err) {
  //     app.renderError(err, req, res, pathname, query);
  //   }
  // };

  fastify.listen(PORT, HOST, err => {
    if (err) throw err;
  });

  return fastify;
};

module.exports = fridge;
