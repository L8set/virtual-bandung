var VirtualBandung = VirtualBandung || {};
VirtualBandung.Play = VirtualBandung.Play || {};

(() => {

  const CONSTS = {
    ELEMENT_ID: {
      AREA: 'playArea',
      WRAPPER: 'playWrapper',
      URP: 'scuadUrp',
      URP_LINK: 'urpLink',
      SCROLL_WRAPPER: 'scrollWrapper',
      CHALLENGE_AREA: 'challengeArea',
      PROGRESS_BAR: 'progress',
      LOADING: 'loadingArea'
    },
    ELEMENT_CLASS: {
      HIDDEN: 'hidden',
      FADE_IN: 'fadein',
      TRANSPARENT: 'transparent'
    },
    FILE_TYPE: {
      PNG: 1,
      JSON: 2
    },
    SPRITE_TYPE: {
      SPRITE: 1,
      TILING: 2
    },
    X: {
      UNIT: 300
    },
    Y: {
      CHARACTER: 7/8,
      FAR_POINT: 1/2,
      VIEW_POINT: 7/9,
      ROAD_LENGTH: 3/8
    },
    Z: {
      UNIT: 10,
      SCREEN: 50
    },
    BASE_WIDTH: 1920,
    BASE_HEIGHT: 1080,
    VIEW_HEIGHT: 10,
    ROAD_WIDTH: 100,
    CHARACTER: {
      WIDTH: 560,
      HEIGHT: 640,
      ANGLE: {
        DOWN: 0,
        LEFT: 3,
        RIGHT: 6,
        UP: 9
      },
      POSE: {
        RIGHT: 0,
        STAND: 1,
        LEFT: 2
      },
    },
    BUILDING: {
      GAP: 100
    },
    TICK_UNIT: 1,
    SCROLL: {
      UNIT: 100,
      RATIO: 0.3
    },
    FILTER: {
      GLOW_WHITE: new PIXI.filters.GlowFilter(15, 2, 1, 0xff9999, 0.5),
      GLOW_PINK: new PIXI.filters.GlowFilter(15, 2, 1, 0xf796b3, 0.5),
      GLOW_BLUE: new PIXI.filters.GlowFilter(20, 20, 1, 0x525cff, 0.5),
      GLOW_GATE: new PIXI.filters.GlowFilter(500, 500, 500, 0x525cff),
      TWINKLE: new PIXI.filters.GlowFilter(10, 2, 1),
      BLUR_1: new PIXI.filters.BlurFilter(0.5, 2),
      BLUR_2: new PIXI.filters.BlurFilter(1, 2)
    },
    STAR_MATRIX: [
      [1, 2, 3, 4, 5, 6, 5, 4, 3, 2],
      [3, 4, 5, 6, 5, 4, 3, 2, 1, 2],
      [5, 6, 5, 4, 3, 2, 1, 2, 3, 4]
    ]
  };

  const container = VirtualBandung.Play.container = new PIXI.Container();

  const App = VirtualBandung.Play.app = new class {
    constructor() {
      this._renderer = new PIXI.autoDetectRenderer({
        width: window.innerWidth,
        height: window.innerHeight,
        antialias: true
      });
      this.currentPosition = 0;
      this.positionX = 0;
      this.positionZ = 0;
      this._pixelRatio = 1;
    }
    get pixelRatio() {
      return this._pixelRatio;
    }
    set pixelRatio(_pixelRatio) {
      this._pixelRatio = devicePixelRatio;
    }
    get renderer() {
      return this._renderer;
    }
    get view() {
      return this.renderer.view;
    }
    get width() {
      return window.innerWidth * this.pixelRatio;
    }
    get height() {
      return window.innerHeight * this.pixelRatio;
    }
    get scale() {
      return this.height / CONSTS.BASE_HEIGHT;
    }
    get characterOriginScale() {
      return this.scale * 280 / CONSTS.CHARACTER.HEIGHT;
    }
    get buildingOriginScale() {
      return this.scale * 10 / 480;
    }
    get originX() {
      return this.width / 2;
    }
    get characterOriginY() {
      return this.height * CONSTS.Y.CHARACTER;
    }
    get buildingOriginY() {
      return this.height * CONSTS.Y.FAR_POINT;
    }
    updateSize() {
      this.renderer.resize(this.width, this.height);
    }
    render() {
      this.renderer.render(container);
    }
  };

  class ImageInfo {
    constructor(_path) {
      this._path = _path;
      this._texture;
      this._sprites = new Map();
    }
    get path() {
      return this._path;
    }
    get sprite() {
      return this.getSprite();
    }
    set sprite(_sprite) {
      this.setSprite(0, _sprite);
    }
    setTexture(_texture) {
      this._texture = _texture;
      this.sprite = new PIXI.Sprite(_texture);
    }
    getSprite(key = 0) {
      return this._sprites.get(key);
    }
    setSprite(key, _sprite) {
      this._sprites.set(key, _sprite);
    }
  }

  const images = VirtualBandung.Play.images = {
    rectangle: new ImageInfo('data/img/rectangle.png'),
    character: new ImageInfo('data/img/character.json'),
    groundUpper: new ImageInfo('data/img/ground_a.png'),
    groundLower: new ImageInfo('data/img/ground_b.png'),
    groundBase: new ImageInfo('data/img/ground_c.png'),
    sky: new ImageInfo('data/img/sky.jpg'),
    starA: new ImageInfo('data/img/star_a.png'),
    starB: new ImageInfo('data/img/star_b.png'),
    starC: new ImageInfo('data/img/star_c.png'),
    cloudA: new ImageInfo('data/img/cloud_a.png'),
    cloudB: new ImageInfo('data/img/cloud_b.png'),
    cloudC: new ImageInfo('data/img/cloud_c.png'),
    moon: new ImageInfo('data/img/moon.png'),
    mountain: new ImageInfo('data/img/mountain.png'),
    gate: new ImageInfo('data/img/gate_a.png'),
    gateSign: new ImageInfo('data/img/gate_sign.png'),
    cityA: new ImageInfo('data/img/city_a.png'),
    cityB: new ImageInfo('data/img/city_b.png'),
    cityC: new ImageInfo('data/img/city_c.png'),
    building1: new ImageInfo('data/img/tower.png'),
    building2: new ImageInfo('data/img/shop_e.png'),
    building3: new ImageInfo('data/img/shop_b.png'),
    building4: new ImageInfo('data/img/building_nec.png'),
    building5: new ImageInfo('data/img/building_toy.png'),
    building6: new ImageInfo('data/img/shop_a.png'),
    scuadLogo: new ImageInfo('data/img/scuad_logo.png')
  };

  const Message = VirtualBandung.message = new class {
    constructor() {
      this.initFlg = false;
      this.showFlg = false;
      this.wrapper = new PIXI.Sprite();
      this.wrapper.anchor.set(0.5, 1);
      this.box = null;
      this.text = null;
      this.button = null;
      this.exit = null;
      this._viewLevel = 0;
      this.intervalId = 0;
      this.isRight = true;
      PIXI.TextMetrics.BASELINE_SYMBOL += 'あ｜';
    }
    get viewLevel() {
      return this._viewLevel;
    }
    set viewLevel(_viewLevel) {
      this._viewLevel = Math.min(Math.max(_viewLevel, 0), 1);
    }
    get width() {
      return Math.min(600, App.width * 0.9);
    }
    get height() {
      return Math.min(900, App.height * 0.9);
    }
    get baseX() {
      const x = Math.min(App.width / 9 + this.width / 2, App.width / 2);
      if (this.isRight) {
        return x;
      } else {
        return App.width - x;
      }
    }
    get baseY() {
      return App.height / 2;
    }
    get boxHeightScale() {
      if (this.viewLevel > 0.5) {
        return 1;
      } else {
        return this.viewLevel / 0.5;
      }
    }
    get textAlpha() {
      if (this.viewLevel < 0.5) {
        return 0;
      } else if (this.viewLevel >= 1) {
        return 1;
      } else {
        return (this.viewLevel - 0.5) / 0.5;
      }
    }
    init() {
      container.addChild(this.wrapper);
      this.box = images.rectangle.sprite;
      this.box.alpha = 0.8;
      this.box.anchor.set(0.5);
      this.wrapper.addChild(this.box);
      this.textStyle = new PIXI.TextStyle({
        fontFamily: 'Poppins',
        align: 'left',
        fill: 'white',
        wordWrap: true,
        breakWords: true,
        fontWeight: 'bold'
      });
      this.buttonStyle = new PIXI.TextStyle({
        fontFamily: 'Poppins',
        align: 'center',
        fill: 'pink',
        wordWrap: false,
        fontStyle: 'italic',
        fontWeight: 'bold'
      });
      this.initFlg = true;
    }
    setTextBox(messageId, messageJp) {
      if (this.text) {
        this.wrapper.removeChild(this.text);
      }
      this.text = new PIXI.Text(`${messageId}\n\n${messageJp}`, this.textStyle);
      this.text.anchor.set(0.5);
      this.wrapper.addChild(this.text);
    }
    setLinkButton(link, buttonName) {
      if (this.button) {
        this.wrapper.removeChild(this.button);
      }
      this.button = new PIXI.Text(buttonName, this.buttonStyle);
      this.button.interactive = true;
      this.button
      .on('click', () => window.open(link))
      .on('tap', () => window.open(link))
      .on('pointerover', () => {
        this.button.style.color = 'green';
        this.button.style.fontSize = (this.width + this.height) / 35;
      })
      .on('pointerout', () => {
        this.button.style.color = 'pink';
        this.button.style.fontSize = (this.width + this.height) / 40;
      });
      this.button.anchor.set(0.5);
      this.wrapper.addChild(this.button);
    }
    resize() {
      if (!this.initFlg) return;
      this.box.position.set(this.baseX, this.baseY);
      this.box.scale.set(this.width / 100, this.height / 100 * this.boxHeightScale);
      this.text.style.wordWrapWidth = this.width * 0.95;
      this.text.position.set(this.baseX, this.baseY * 0.9);
      this.text.style.fontSize = (this.width + this.height) / 55;
      this.text.alpha = this.textAlpha;
      this.button.position.set(this.baseX, this.baseY * 1.7);
      this.button.style.fontSize = (this.width + this.height) / 40;
      this.button.alpha = this.textAlpha;
    }
    show(messageId, messageJp, link, buttonName, isRight) {
      if (this.showFlg) return;
      if (!this.initFlg) {
        this.init();
      }
      this.isRight = isRight;
      this.setTextBox(messageId, messageJp);
      this.setLinkButton(link, buttonName);
      this.box.alpha = 0.8;
      this.resize();
      this.showFlg = true;
    }
    hide() {
      if (!this.showFlg) return;
      this.showFlg = false;
    }
    tick() {
      if (this.showFlg && this.viewLevel < 1) {
        this.viewLevel += 0.1;
        this.resize();
      } else if (!this.showFlg && this.viewLevel > 0) {
        this.viewLevel -= 0.1;
        this.resize();
      }
    }
  };

  class Building {
    constructor(imageInfo, xIndex, zIndex, link, button, messageId, messageJp) {
      this.imageInfo = imageInfo;
      this.xIndex = xIndex;
      this.zIndex = zIndex;
      this.link = link;
      this.button = button;
      this.messageId = messageId;
      this.messageJp = messageJp;
      this.showFlg = false;

      const sprite = imageInfo.sprite;
      sprite.anchor.set(0.5, 1);
      sprite.on('pointerover', () => this.onPointerOver())
      .on('pointerout', () => this.onPointerOut());
    }
    get sprite() {
      return this.imageInfo.sprite;
    }
    get positionX() {
      return this.xIndex * CONSTS.X.UNIT;
    }
    get positionZ() {
      return CONSTS.Z.SCREEN + this.zIndex * CONSTS.Z.UNIT;
    }
    get relativeX() {
      return this.positionX - App.positionX;
    }
    get relativeZ() {
      return this.positionZ - App.positionZ;
    }
    get scale() {
      return CONSTS.Z.SCREEN / this.relativeZ;
    }
    get screenX() {
      return App.originX + this.relativeX * this.scale;
    }
    get screenY() {
      const originY = App.height * CONSTS.Y.VIEW_POINT;
      const roadLength = CONSTS.Y.ROAD_LENGTH * App.height;
      return originY - roadLength * (1 - this.scale);
    }
    onPointerOver() {
      
    }
    onPointerOut() {

    }
    showMessage() {
      if (!this.link) return;
      Message.show(this.messageId, this.messageJp, this.link, this.button, this.xIndex > 0);
    }
    openLink() {
      if (!this.link) return;
      window.open(this.link);
    }
    updateFilters() {
      if (this.xIndex === 0) {
        this.sprite.filters = [CONSTS.FILTER.GLOW_GATE, CONSTS.FILTER.GLOW_GATE];
        images.gateSign.sprite.visible = false;
      } else {
        this.sprite.filters = [];
      }
      this.sprite.interactive = false;
      if (Math.abs(this.scale - 1) < 0.03) {
        this.sprite.filters.push(CONSTS.FILTER.GLOW_WHITE);
        this.sprite.interactive = true;
        this.showMessage();
        if (this.xIndex === 0) {
          images.gateSign.sprite.visible = true;
        }
        this.showFlg = true;
      } else if (this.showFlg) {
        Message.hide();
        this.showFlg = false;
      }
    }
    updatePosition() {
      const sprite = this.sprite;
      if (this.relativeZ <= CONSTS.Z.SCREEN - CONSTS.Z.UNIT) {
        sprite.visible = false;
        return;
      }
      sprite.visible = true;
      sprite.position.set(this.screenX, this.screenY);
      sprite.scale.set(this.scale);
      this.updateFilters();
    }
    tick(ticker) {
    }
  }

  const Background = new class {
    constructor() {
      const wrapper = this._wrapper = new PIXI.Sprite();
      wrapper.anchor.set(0.5, 1);
      const skyWrapper = this._skyWrapper = new PIXI.Sprite();
      skyWrapper.anchor.set(0.5, 1);
      wrapper.addChild(skyWrapper);
      this.starTicker = 0;
    }
    get wrapper() {
      return this._wrapper;
    }
    get skyWrapper() {
      return this._skyWrapper;
    }
    setSprites() {
      const wrapper = this.wrapper;
      const cloudA = images.cloudA.sprite;
      cloudA.anchor.set(0.5);
      wrapper.addChild(cloudA);
      const cloudB = images.cloudB.sprite;
      cloudB.anchor.set(0.5);
      wrapper.addChild(cloudB);
      const cloudC = images.cloudC.sprite;
      cloudC.anchor.set(0.5);
      wrapper.addChild(cloudC);
      this.setSky();
      this.setMountain();
      this.setGround();
    }
    setSky() {
      const sky = images.sky.sprite;
      sky.anchor.set(0.5, 1);
      this.skyWrapper.addChild(sky);
      [images.starA, images.starB, images.starC].forEach((image, index) => {
        const sprite = image.sprite;
        sprite.anchor.set(0.5, 1);
        sprite.blendMode = PIXI.BLEND_MODES.ADD;
        sprite.alpha = Math.pow(0.5, index * 0.5);
        sprite.filters = [CONSTS.FILTER.TWINKLE, CONSTS.FILTER.BLUR_1];
        this.skyWrapper.addChild(sprite);
      });
      const moon = images.moon.sprite;
      moon.anchor.set(0.5);
      this.skyWrapper.addChild(moon);
    }
    setMountain() {
      const mountain = images.mountain.sprite;
      mountain.anchor.set(0.7, 1);
      mountain.blendMode = PIXI.BLEND_MODES.MULTIPLY;
      this.wrapper.addChild(mountain);
    }
    setGround() {
      const groundBase = images.groundBase.sprite;
      groundBase.anchor.set(0.5, 1);
      this.wrapper.addChild(groundBase);
      const cityC = images.cityC.sprite;
      cityC.anchor.set(0.5, 1);
      cityC.alpha = 0.7;
      cityC.filters = [CONSTS.FILTER.BLUR_2];
      this.wrapper.addChild(cityC);
      const groundLower = images.groundLower.sprite;
      groundLower.anchor.set(0.5, 1);
      this.wrapper.addChild(groundLower);
      const cityB = images.cityB.sprite;
      cityB.anchor.set(1);
      cityB.alpha = 0.8;
      cityB.filters = [CONSTS.FILTER.GLOW_BLUE, CONSTS.FILTER.BLUR_1];
      this.wrapper.addChild(cityB);
      const cityA = images.cityA.sprite;
      cityA.anchor.set(1);
      cityA.alpha = 0.9;
      cityA.filters = [CONSTS.FILTER.GLOW_PINK, CONSTS.FILTER.BLUR_1];
      this.wrapper.addChild(cityA);
      const groundUpper = images.groundUpper.sprite;
      groundUpper.anchor.set(0.5, 1);
      this.wrapper.addChild(groundUpper);
    }
    resizeSky() {
      const sky = images.sky.sprite;
      sky.scale.set(App.width / CONSTS.BASE_WIDTH, App.height / CONSTS.BASE_HEIGHT);
      [images.starA, images.starB, images.starC].forEach(image => {
        image.sprite.scale.set(App.scale);
        image.sprite.position.set(0);
      });
      const moon = images.moon.sprite;
      moon.scale.set(App.scale);
      moon.position.set(App.width * 0.4, -App.height * 0.9)
    }
    resizeMountain() {
      const mountain = images.mountain.sprite;
      mountain.scale.set(App.scale);
      mountain.position.set(App.width * 0.35, - App.height * 0.4);
    }
    resizeGround() {
      const scaleHeight = App.scale * 1.3;
      const scaleWidth = (() => {
        if (CONSTS.BASE_WIDTH * App.scale >= App.width) {
          return App.scale;
        } else {
          return App.width / CONSTS.BASE_WIDTH;
        }
      })();
      [images.groundBase, images.groundLower, images.groundUpper].forEach(image => {
        image.sprite.scale.set(scaleWidth, scaleHeight);
      });
      const cityA = images.cityA.sprite;
      cityA.scale.set(App.scale);
      cityA.position.set(-App.width * 0.1, -App.height * 0.4);
      const cityB = images.cityB.sprite;
      cityB.scale.set(App.scale);
      cityB.position.set(-App.width * 0.3, -App.height* 0.42);
      const cityC = images.cityC.sprite;
      cityC.scale.set(App.scale);
      cityC.position.set(App.width * 0.1, -App.height * 0.46);
    }
    resize() {
      this.wrapper.position.set(App.width / 2, App.height);
      this.resizeSky();
      this.resizeMountain();
      this.resizeGround();
      App.render();
    }
    twinkleStars() {
      this.starTicker = (this.starTicker + 1) % 10;
      [images.starA, images.starB, images.starC].forEach((image, index) => {
        const sprite = image.sprite;
        sprite.alpha = CONSTS.STAR_MATRIX[index][this.starTicker] / 6;
      });
    }
    moveGround() {
      const ground = images.groundGrad.sprite;
      ground.rotation += 0.1;
    }
    tick(ticker) {
      this.twinkleStars();
    }
    show() {
      this.setSprites();
      this.resize();
      container.addChild(this.wrapper);
    }
  };

  const Character = VirtualBandung.Play.character = new class {
    constructor() {
      const wrapper = new PIXI.Sprite();
      wrapper.anchor.set(0.5, 1);
      wrapper.alpha = 1;
      wrapper.visible = false;
      this._wrapper = wrapper;
      this._angle = CONSTS.CHARACTER.ANGLE.DOWN;
      this._pose = CONSTS.CHARACTER.POSE.STAND;
      this._spriteSet = images.character;
    }
    get wrapper() {
      return this._wrapper;
    }
    get angle() {
      return this._angle;
    }
    set angle(_angle) {
      if (this._angle !== _angle) {
        this.setSprite(_angle, this.pose);
        this._angle = _angle;
      }
    }
    get pose() {
      return this._pose < 3 ? this._pose : CONSTS.CHARACTER.POSE.STAND;
    }
    set pose(_pose) {
      if (this._pose !== _pose) {
        const nextPose = _pose < 3 ? _pose : CONSTS.CHARACTER.POSE.STAND;
        this.setSprite(this.angle, nextPose);
        this._pose = _pose;
      }
    }
    get sprite() {
      return this.wrapper.getChildAt(0);
    }
    setSprite(_angle, _pose) {
      this.wrapper.removeChildren();
      const sprite = this._spriteSet.getSprite(_angle + _pose);
      sprite.anchor.set(0.5, 1);
      this.wrapper.addChild(sprite);
    }
    resizeWrapper() {
      this.wrapper.position.set(App.originX, App.characterOriginY);
      this.wrapper.scale.set(App.characterOriginScale);
    }
    init() {
      this.resizeWrapper();
      this.setSprite(this.angle, this.pose);
      if (!container.children.includes(this.wrapper)) {
        container.addChild(this.wrapper);
      }
    }
    show() {
      this.init();
    }
    walk() {
      this.pose = (this._pose + 1) % 4;
    }
    stop() {
      this.pose = CONSTS.CHARACTER.POSE.STAND;
    }
  };

  const Buildings = VirtualBandung.Play.buildings = new class {
    constructor() {
      this._buildings = [];
    }
    get maxZIndex() {
      return this._buildings.length + 1;
    }
    get maxPosition() {
      return this.maxZIndex * CONSTS.SCROLL.UNIT;
    }
    init() {
      this._buildings = [
        [images.building1, 1.5, 'https://worldscuad.com/', 'LEARN MORE',
`SCUAD terlahir dari ide dua orang perempuan yang bertemu di Tokyo.
Mereka memiliki visi yang sama untuk menghubungkan anak-anak muda lintas negara dalam berkontribusi ide dan kreativitas, untuk menyelesaikan masalah sosial dan budaya serta menjadikan dunia yang lebih baik.`,
`SCUADのはじまりは東京で出会った2人の女性たちのアイディア。
国を越えて同世代の若い人たちを繋ぎ、ソーシャルアクションの分野とカルチャーの分野も繋いで
みんなでクリエイティブなものごとを生み出せたら素敵な世界をつくれるはず、と同じ夢を描いて動き出しました。`],
        [images.building2, -1.5, 'https://www.instagram.com/ppikanto/', 'KNOW MORE',
`SCUAD kini telah berkembang menjadi sebuah grup besar yang terdiri dari beragam orang-orang yang berbagi energi dan kreativitas yang sama.
Acara SCUAD dapat terlaksana dengan adanya bantuan dari PPI Kanto.
Jika kamu tertarik dengan kuliah di Jepang, kunjungi dan follow akun Instagram @ppikanto!`,
`気づけばSCUADは成長し、同じ志と高いクリエイティビティを持つ様々な人たちが集まる大きなチームになりました。
このイベントはインドネシア留学生協会関東支部 (PPI Kanto) を運営パートナーに迎えたことで実現しています。`],
        [images.building3, 3.5, 'https://www.prulmarket.com/2PfkYA2Mg9/home', 'CHECK THE MARKET',
`Sebuah acara tidak akan besar dan sukses tanpa adanya dukungan dari tim humas!
Ya, SCUAD dengan bangga berkolaborasi dengan PRUL Channel dan PRUL Market, sebuah marketplace khusus barang-barang hobi yang unik dari Jepang.
Kalau kamu tertarik dengan konten seputar jalan-jalan virtual di Jepang atau unboxing barang-barang mainan dari Jepang, jangan lupa cek YouTube PRUL Channel dan aplikasi PRUL Market ya!`,
`イベントで大きなインパクトを出すには広報がかかせません
SCUADは現地メディアパートナーとして日本のホビーアイテムを扱う大手マーケットプレイスPrul MarketとPrul Channelにサポートいただいています。`],
        [images.building4, -3.5, 'https://future.nec/en/', 'LEARN MORE',
`Bagaimana SCUAD bisa membuat acara yang mengundang para penyanyi ternama Indonesia?
Tentu saja kami tidak sendiri. Kami bersyukur acara SCUAD ini disponsori oleh NEC.
Apakah kamu familiar dengan istilah “Inovasi dari Jepang”?
Yuk cek website mereka dan cari tahu tentang masa depan teknologi! `,
`この挑戦的なイベントは、NEC未来創造会議や個人スポンサーの皆さまによって叶えることが出来ました。
インドネシアの未来もわくわくさせる“日本発イノベーション”のこの先はこちらから。
（英語ページが開きます。日本語へはリンク先で切り替えて下さい）`],
        [images.building5, 2, 'https://www.youtube.com/watch?v=LjQDIWmS7a0', 'WATCH',
`Ide-ide cemerlang dari para SCUADers akan dinilai oleh juri-juri keren di SCUAD.
Kami mengucapkan terima kasih atas dukungan dari KBRI Tokyo, Garuda Indonesia perwakilan Tokyo, dan tentunya Disbudpar Kota Bandung sebagai juri dalam acara ini!`,
`バンドン市の観光と街づくりをテーマにした素敵な未来を作るアクションのジャッジとして、
在日本インドネシア大使館、ガルーダエアライン東京社、バンドン市観光局にお越しいただきました。
SCUADersたちのアイディアが、バンドン市から世界を変える種となりますように。`],
        [images.building6, -3, 'https://scuad.myshopify.com/', 'CHECK THE SHOP',
`Save the moment!
Miliki merchandise SCUAD sekarang juga sebelum kehabisan!`,
`さぁ、SCUADのイベントです！
イベントグッズを着てSCUADのメッセージを広めながら楽しくて素敵な未来を作っていきましょう！`],
        [images.gate, 0, null, null, null]
      ].map(([imageInfo, x, link, button, messageId, messageJp], index) => new Building(imageInfo, x, index + 1, link, button, messageId, messageJp));
      Building.count = this._buildings.length;
      const gateSign = images.gateSign.sprite;
      gateSign.anchor.set(0.5, 1);
      gateSign.position.set(0, -App.height * 0.5);
      images.gate.sprite.addChild(gateSign);
    }
    showAll() {
      if (this._buildings.length === 0) {
        this.init();
      }
      Array.from(this._buildings).reverse().forEach(building => {
        building.updatePosition();
        container.addChild(building.sprite);
      });
    }
    updateAll() {
      this._buildings.forEach(building => building.updatePosition());
    }
    tick(ticker) {
      this._buildings.forEach(building => building.tick(ticker));
    }
  };

  const Logo = new class {
    constructor() {

    }
    onClick() {
      window.open('https://worldscuad.com/ja/');
    }
    resize() {
      const scuadLogo = images.scuadLogo.sprite;
      scuadLogo.scale.set(App.scale);
      scuadLogo.position.set(0);
    }
    show() {
      const scuadLogo = images.scuadLogo.sprite;
      scuadLogo.anchor.set(0);
      scuadLogo.alpha = 0.5
      scuadLogo.interactive = true;
      scuadLogo.on('click', () => this.onClick()).on('tap', () => this.onClick());
      container.addChild(scuadLogo);
      this.resize();
    }
  };

  const Swipe = VirtualBandung.Play.swipe = new class {
    constructor() {
      this.style = new PIXI.TextStyle({
        fontFamily: 'Poppins',
        align: 'center',
        fill: 'violet',
        fontWeight: 'bold'
      });
      this.sprite = new PIXI.Text('swipe', this.style);
      this.sprite.anchor.set(0.5, 1);
      this.alpha = 1;
    }
    show() {
      container.addChild(this.sprite);
      this.resize();
    }
    resize() {
      this.style.fontSize = 58;
      this.sprite.position.set(App.width / 2, App.height - 10);
      this.sprite.alpha = Math.abs(this.alpha);
    }
    tick() {
      this.alpha += 0.02;
      if (this.alpha >= 1) {
        this.alpha = -1;
      }
      this.resize();
    }
  }

  const Event = new class {
    constructor() {
      this._playable = false;
      this._startPosition;
      this._nextPosition = 0;
      this._touching = false;
      this._lastY = 0;
      this._moving = false;
      this._walking = false;
      this._reachedEnd = false;
      this.intervalID = {
        tick: 0,
        character: 0,
        buildings: 0,
        road: 0
      };
      this.goInner = true;
    }
    get playable() {
      return this._playable;
    }
    set playable(_playable) {
      this._playable = _playable;
    }
    get nextPosition() {
      return parseInt(this._nextPosition);
    }
    increment(deltaPosition) {
      let nextPosition = Math.min(this._nextPosition + deltaPosition, Buildings.maxPosition);
      nextPosition = Math.max(nextPosition, 0)
      this._nextPosition = nextPosition;
    }
    roundPosition() {
      this._nextPosition = Math.min(Math.ceil(this._nextPosition / CONSTS.SCROLL.UNIT) * CONSTS.SCROLL.UNIT, Buildings.maxPosition);
    }
    onResize() {
      App.updateSize();
      ImageLoader.resizeImages();
      Message.resize();
      App.render();
    }
    onWheel(event) {
      if (!this.playable) return;
      this.increment(event.deltaY * CONSTS.SCROLL.RATIO);
      if (!this._moving) {
        this.startMoving();
      }
    }
    onTouchStart(event) {
      if (!this.playable) return;
      const touch = event.touches[0];
      this._touching = true;
      this._lastY = touch.screenY;
      if (!this._moving) {
        this.startMoving();
      }
    }
    onTouchMove(event) {
      if (!this.playable) return;
      const touch = event.touches[0];
      const currentY = touch.screenY;
      this.increment(-(currentY - this._lastY) * CONSTS.SCROLL.RATIO);
      this._lastY = touch.screenY;
      if (!this._moving) {
        this.startMoving();
      }
    }
    onTouchEnd(event) {
      if (!this.playable) return;
      this._touching = false;
      // this.roundPosition();
    }
    startMoving() {
      if (!this._moving) {
        this.startMove();
      }
    }
    startMove() {
      this._startPosition = App.distance;
      this._moving = true;
      this._walking = true;
    }
    tick(ticker) {
      if (this._walking) {
        if (ticker % 3 === 0) this.moveCharacter();
      }
      if (this._moving) {
        this.moveViewPoint();
        this.moveBuildings();
      }
      this.updateIconScroll();
    }
    moveViewPoint() {
      this.updateCurrentPosition();
      this.updatePositionXZ();
      if (parseInt(App.currentPosition) === Buildings.maxPosition) {
        this.onReachEnd();
      }
    }
    updateCurrentPosition() {
      const positionDistance = this.nextPosition - App.currentPosition;
      if (Math.round(positionDistance) === 0) {
        App.currentPosition = this.nextPosition;
        this._moving = false;
        return;
      }

      const deltaUnit = positionDistance / Math.abs(positionDistance);
      const deltaPosition = deltaUnit * Math.pow(Math.max(Math.abs(positionDistance / (CONSTS.SCROLL.UNIT * CONSTS.SCROLL.RATIO)), 2), 2);
      let currentPosition = App.currentPosition + deltaPosition;
      if (deltaUnit > 0) {
        currentPosition = Math.min(currentPosition, this.nextPosition);
      } else {
        currentPosition = Math.max(currentPosition, this.nextPosition);
      }
      currentPosition = Math.max(currentPosition, 0);
      currentPosition = Math.min(currentPosition, Buildings.maxPosition);
      App.currentPosition = currentPosition;
      this.goInner = deltaPosition >= 0;
    }
    updatePositionXZ() {
      const currentPosition = App.currentPosition;
      let nextIndex = Math.ceil(currentPosition / CONSTS.SCROLL.UNIT);
      nextIndex = Math.max(nextIndex, 1) - 1;
      const lastUnitPosition = nextIndex * CONSTS.SCROLL.UNIT
      const nextRatio = (() => {
        const delta = currentPosition - lastUnitPosition;
        const ratio = delta / (CONSTS.SCROLL.UNIT * 0.7);
        if (ratio < 1) {
          return ratio;
        } else {
          return 1;
        }
      })();
      let frontXIndex, frontZIndex, backXIndex, backZIndex;
      if (nextIndex < 1) {
        frontXIndex = 0;
        frontZIndex = 0;
      } else {
        const frontBuilding = Buildings._buildings[nextIndex - 1];
        frontXIndex = frontBuilding.xIndex;
        frontZIndex = frontBuilding.zIndex;
      }
      if (nextIndex < Buildings._buildings.length) {
        const backBuilding = Buildings._buildings[nextIndex];
        backXIndex = backBuilding.xIndex;
        backZIndex = backBuilding.zIndex;
      } else {
        backXIndex = 0;
        backZIndex = Buildings.maxZIndex;
      }
      App.positionX = (frontXIndex + (backXIndex - frontXIndex) * nextRatio) * CONSTS.X.UNIT;
      App.positionZ = (frontZIndex + (backZIndex - frontZIndex) * nextRatio) * CONSTS.Z.UNIT;
      if (nextRatio === 1 || nextRatio === 0) {
        Character.angle = CONSTS.CHARACTER.ANGLE.DOWN;
      } else if ((backXIndex > frontXIndex && this.goInner) || (backXIndex < frontXIndex && !this.goInner)) {
        Character.angle = CONSTS.CHARACTER.ANGLE.RIGHT;
      } else if ((backXIndex > frontXIndex && !this.goInner) || (backXIndex < frontXIndex && this.goInner)) {
        Character.angle = CONSTS.CHARACTER.ANGLE.LEFT;
      } else if (this.goInner) {
        Character.angle = CONSTS.CHARACTER.ANGLE.UP;
      } else {
        Character.angle = CONSTS.CHARACTER.ANGLE.DOWN;
      }
    }
    moveCharacter() {
      if (!this._moving) {
        Character.stop();
        this._walking = false;
        return;
      }
      Character.walk();
    }
    moveBuildings() {
      Buildings.updateAll();
    }
    updateIconScroll() {
      const iconScroll = document.getElementById(CONSTS.ELEMENT_ID.SCROLL_WRAPPER);
      let opacity = Math.max(0, 1 - App.currentPosition / (CONSTS.SCROLL.UNIT / 3));
      iconScroll.style.opacity = opacity;
    }
    onReachEnd() {
      if (this._reachedEnd) return;
      document.getElementById(CONSTS.ELEMENT_ID.URP_LINK).click();
      this._reachedEnd = true;
    }
  };

  const Ticker = VirtualBandung.Play.ticker = new class {
    constructor() {
      const ticker = this._ticker = PIXI.Ticker.shared;
      ticker.autoStart = false;
      ticker.speed = 2;
      ticker.add(time => this.tick());
      ticker.stop();
      this._tick = 0;
    }
    tick() {
      Event.tick(this._tick);
      Background.tick(this._tick);
      Buildings.tick(this._tick);
      Message.tick();
      Swipe.tick();
      this._tick++;
      App.render();
    }
    start() {
      this._ticker.start();
    }
  }

  const AppCreator = new class {
    createApp() {
      const playWrapper = document.getElementById(CONSTS.ELEMENT_ID.WRAPPER);
      playWrapper.appendChild(App.view);

      window.addEventListener('resize', () => Event.onResize());
      window.addEventListener('wheel', (event) => Event.onWheel(event));
      window.addEventListener('touchstart', (event) => Event.onTouchStart(event));
      window.addEventListener('touchmove', (event) => Event.onTouchMove(event));
      window.addEventListener('touchend', (event) => Event.onTouchEnd(event));
    }
  };

  const ImageLoader = new class {

    constructor() {
      this.loaded = false;
      this.loadingFadeIntervalId = 0;
    }
    setSprites() {
      Background.show();
      Buildings.showAll();
      Character.show();
      Logo.show();
      Swipe.show();

      this.resizeImages();
      App.render(container);
    }
    resizeImages() {
      Background.resize();
      Character.resizeWrapper();
      Buildings.updateAll();
      Logo.resize();
      Swipe.resize();
    }
    onLoadImages(resources) {
      let textures;

      Object.entries(resources).forEach(([imageKey, resource]) => {

        if (images.hasOwnProperty(imageKey)) {
          textures = resource.textures;

          if (!textures) {
            images[imageKey].setTexture(resource.texture);
          } else {
            Object.entries(textures).forEach(([textureKey, texture]) => {
              images[imageKey].setSprite(parseInt(textureKey), new PIXI.Sprite(texture));
            });
          }
        }
      });
    }

    loadProgressHandler(loader, resource) {
      const progress = document.getElementById(CONSTS.ELEMENT_ID.PROGRESS_BAR);
      progress.value = loader.progress;
    }

    loadCompleteHandler(loader, resource) {
      if (loader.progress < 100) return;
      this.setSprites();
      AppCreator.createApp();
      Ticker.start();
      this.loaded = true;
      const playArea = document.getElementById(CONSTS.ELEMENT_ID.AREA);
      const loadingArea = document.getElementById(CONSTS.ELEMENT_ID.LOADING);
      playArea.classList.add(CONSTS.ELEMENT_CLASS.FADE_IN);
      playArea.classList.remove(CONSTS.ELEMENT_CLASS.TRANSPARENT);
      setTimeout(() => {
        loadingArea.classList.add(CONSTS.ELEMENT_CLASS.HIDDEN);
      }, 1000);
      Event.playable = true;
    }

    fadeLoading() {
      const playArea = document.getElementById(CONSTS.ELEMENT_ID.AREA);
      playArea.style.opacity = parseInt(playArea.style.opacity || 0) + 0.01;
      console.log(loadingArea.style.opacity)
      if (playArea.style.opacity >= 1) {
        clearInterval(this.loadingFadeIntervalId);
      }
    }

    loadImages() {
      const loader = PIXI.Loader.shared;

      Object.entries(images).forEach(([imageKey, imageInfo]) => {
        loader.add(imageKey, imageInfo.path);
      });
      loader.add('main', 'font/Poppins-Bold.ttf');

      loader.load((_loader, _resources) => this.onLoadImages(_resources));
      loader.onProgress.add((_loader, _resource) => this.loadProgressHandler(_loader, _resource));
      loader.onComplete.add((_loader, _resource) => this.loadCompleteHandler(_loader, _resource));
    }
  };

  VirtualBandung.Play.init = function() {
    ImageLoader.loadImages();
  };

  VirtualBandung.Play.start = function() {
    Event.playable = true;
  };

  {
    VirtualBandung.Play.init();
  }
})(this);