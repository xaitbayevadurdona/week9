export default function appSrc(express, bodyParser, createReadStream, crypto, http, mongodb, Zombie, cors, path) {
  const app = express();
  const __dirname = path.resolve();

  app.use(bodyParser.json());
  app.use(express.urlencoded());
  app.set('view engine', 'pug');
  app.set('views', path.join(__dirname, 'public'));
  app.use(express.static(path.join(__dirname, 'public')));

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,OPTIONS,DELETE");
    next();
  });

  app.use(cors());
  app.options('*', cors());

  app.use('/login/', (req, res) => res.send('xaitbayevadurdona'));

  app.use('/code/', (req, res) => {
    let readStream = createReadStream(import.meta.url.substring(7));
    readStream.on('open', function () {
      readStream.pipe(res);
    });
  });

  app.use('/sha1/:input/', (req, res) => {
    res.send(crypto.createHash('sha1').update(req.params.input, "binary").digest("hex"))
  });

  app.use('/req/', (req, res) => {
    if(req.method === "GET") {
      http.get(req.query.addr,  (result) => {

        let rawData = '';
        result.on('data', (chunk) => { rawData += chunk; });
        result.on('end', () => {
            res.send(rawData);
        });
      })
    }

    if(req.method === "POST") {
      http.get(req.body.addr, (result) => {
        let rawData = '';
        result.on('data', (chunk) => { rawData += chunk; });
        result.on('end', () => {
          res.send(rawData);
        });
      });
    }
  });


    app.get('/wordpress/wp-json/wp/v2/posts/1', (req, res) => res.status(200).json({title: {id: 1, rendered: "xaitbayevadurdona"}}))
    app.post('/render/', (req, res) => {
      const {random2, random3} = req.body;


      let { addr } = req.query;

      console.log(addr);

      res.render('random', {random2: random2, random3: random3,});
    })
    app.get('/wordpress/', (req, res) => res.status(200).render('wordpress'))

  app.post('/insert/', async (req, res) => {
    const {login, password, URL} = req.body;

    const client = new mongodb.MongoClient(URL);

    try {
      await client.connect();

      const database = client.db('readusers');
      const collection = database.collection('users');
      const doc = { login: login, password: password };
      const result = await collection.insertOne(doc);

    } catch(error) {
      console.log(error);
    } finally {
      await client.close();
    }

    res.status(200).end();

  });

  app.use('/test/', async(req, res) => {
    const page = new Zombie();
    await page.visit(req.query.URL);
    await page.pressButton('#bt');
    const result = await page.document.querySelector('#inp').value;
    res.send(result)
  });

  app.all('*', (req, res) => res.send('xaitbayevadurdona'));
  return app;
}
