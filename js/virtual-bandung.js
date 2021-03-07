var VirtualBandung = VirtualBandung || {};
VirtualBandung.Play = VirtualBandung.Play || {};

(() => {

  const CONSTS = {
    ELEMENT_ID: {
      AREA: 'playArea',
      WRAPPER: 'playWrapper',
      URP: 'scuadUrp',
      URP_LINK: 'urpLink'
    },
    ELEMENT_CLASS: {
      HIDDEN: 'hidden-section'
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
      UNIT: 100
    },
    FILTER: {
      GLOW_WHITE: new PIXI.filters.GlowFilter(15, 2, 1, 0xff9999, 0.5),
      GLOW_PINK: new PIXI.filters.GlowFilter(15, 2, 1, 0xf796b3, 0.5),
      GLOW_BLUE: new PIXI.filters.GlowFilter(20, 20, 1, 0x525cff, 0.5),
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
        height: window.innerHeight
      });
      this.currentPosition = 0;
      this.positionX = 0;
      this.positionZ = 0;
    }
    get renderer() {
      return this._renderer;
    }
    get view() {
      return this.renderer.view;
    }
    get width() {
      return window.innerWidth;
    }
    get height() {
      return window.innerHeight;
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
    cityA: new ImageInfo('data/img/city_a.png'),
    cityB: new ImageInfo('data/img/city_b.png'),
    cityC: new ImageInfo('data/img/city_c.png'),
    necForum: new ImageInfo('data/img/building_nec.png'),
    buildingToy: new ImageInfo('data/img/building_toy.png'),
    readyToTravel: new ImageInfo('data/img/building_travel.png'),
    scuadShop: new ImageInfo('data/img/shop_scuad.png'),
    apparelShop: new ImageInfo('data/img/shop_apparel.png'),
    travelGuide: new ImageInfo('data/img/shop_guide.png'),
    foodBooth: new ImageInfo('data/img/booth_food.png')
  };

  class Building {
    constructor(imageInfo, xIndex, zIndex, link, message) {
      this.imageInfo = imageInfo;
      this.xIndex = xIndex;
      this.zIndex = zIndex;
      this.link = link;
      this.message = message;

      const sprite = imageInfo.sprite;
      if (xIndex > 0) {
        sprite.anchor.set(0, 1);
      } else if (xIndex < 0) {
        sprite.anchor.set(1, 1);
      } else {
        sprite.anchor.set(0.5, 1);
      }
      sprite.on('pointerover', () => this.onPointerOver())
      .on('pointerout', () => this.onPointerOut())
      .on('click', () => this.onClick());
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
    onClick() {
      if (this.link) {
        window.open(this.link);
      }
    }
    updateFilters() {
      if (this.exactScale > 0.9 && this.exactScale < 1.1) {
        this.sprite.filters = [CONSTS.FILTER.GLOW_WHITE];
      } else {
        this.sprite.filters = [];
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
      App.render();
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
        [images.foodBooth, 1.5, '', ''],
        [images.buildingToy, -1.5, '', ''],
        [images.apparelShop, 3.5, '', ''],
        [images.readyToTravel, -3.5, 'https://instagram.com/worldscuad/', 'Shibuya Street Apparel'],
        [images.travelGuide, 2, 'https://worldscuad.com', 'Sponsor'],
        [images.necForum, -1, 'https://future.nec/en/', 'Know more about SCUAD before your travel'],
        [images.scuadShop, 1, 'https://scuad.myshopify.com', 'Follow our IG , join the campaign and WIN THE FLIGHT!'],
        [images.gate, 0, null, null]
      ].map(([imageInfo, x, link, message], index) => new Building(imageInfo, x, index + 1, link, message));
      Building.count = this._buildings.length;
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
  };

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
      App.render();
    }
    onWheel(event) {
      if (!this.playable) return;
      if (event.deltaY > 0) {
        this.increment(CONSTS.SCROLL.UNIT);
      } else {
        this.increment(-CONSTS.SCROLL.UNIT);
      }
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
      this.increment(currentY - this._lastY);
      this._lastY = touch.screenY;
      if (!this._moving) {
        this.startMoving();
      }
    }
    onTouchEnd(event) {
      if (!this.playable) return;
      this._touching = false;
      this.roundPosition();
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
        if (ticker % 10 === 0) this.moveCharacter();
      }
      if (this._moving) {
        this.moveViewPoint();
        this.moveBuildings();
      }
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
      const distanceRatio = Math.abs((positionDistance % CONSTS.SCROLL.UNIT) / CONSTS.SCROLL.UNIT);
      const deltaPosition = (() => {
        if (positionDistance === 0) return 0;
        const unit = positionDistance / Math.abs(positionDistance);
        if (distanceRatio < 0.1 || distanceRatio > 0.9) {
          return unit;
        } else {
          return Math.round(unit * Math.pow((0.5 - Math.abs(0.5 - distanceRatio)) * 10, 2));
        }
      })();
      const currentPosition = (() => {
        let _currentPosition = App.currentPosition + deltaPosition;
        _currentPosition = Math.max(_currentPosition, 0);
        _currentPosition = Math.min(_currentPosition, Buildings.maxPosition);
        return _currentPosition;
      })();
      App.currentPosition = currentPosition;
      if (positionDistance === 0) {
        this._moving = false;
      }
    }
    updatePositionXZ() {
      const currentPosition = App.currentPosition;
      let nextIndex = Math.ceil(currentPosition / CONSTS.SCROLL.UNIT);
      nextIndex = Math.max(nextIndex, 1) - 1;
      const lastUnitPosition = nextIndex * CONSTS.SCROLL.UNIT
      const nextRatio = (() => {
        const delta = currentPosition - lastUnitPosition;
        const ratio = delta / CONSTS.SCROLL.UNIT;
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
      if (nextIndex < Buildings.maxZIndex) {
        const backBuilding = Buildings._buildings[nextIndex];
        backXIndex = backBuilding.xIndex;
        backZIndex = backBuilding.zIndex;
      } else {
        backXIndex = 0;
        backZIndex = Buildings._buildings.length;
      }
      App.positionX = (frontXIndex + (backXIndex - frontXIndex) * nextRatio) * CONSTS.X.UNIT;
      App.positionZ = (frontZIndex + (backZIndex - frontZIndex) * nextRatio) * CONSTS.Z.UNIT;
    }
    moveCharacter() {
      if (!this._moving) {
        Character.stop();
        this._walking = false;
        return;
      }
      // const building = (App.distance / CONSTS.SCROLL.UNIT) * 10;
      // if (building > 5 && building < 105 && (building % 10 > 8 || building % 10 < 2)) {
      //   if (Math.round(building / 10) % 2 === 0) {
      //     Character.angle = CONSTS.CHARACTER.ANGLE.RIGHT;
      //   } else {
      //     Character.angle = CONSTS.CHARACTER.ANGLE.LEFT;
      //   }
      // } else if (App.distance < this.nextPosition && Character.angle !== CONSTS.CHARACTER.ANGLE.UP) {
      //   Character.angle = CONSTS.CHARACTER.ANGLE.UP;
      // } else if (App.distance > this.nextPosition && Character.angle !== CONSTS.CHARACTER.ANGLE.DOWN) {
      //   Character.angle = CONSTS.CHARACTER.ANGLE.DOWN;
      // }
      Character.walk();
    }
    moveBuildings() {
      Buildings.updateAll();
    }
    onReachEnd() {
      if (this._reachedEnd) return;
      document.getElementById(CONSTS.ELEMENT_ID.URP_LINK).click();
      this._reachedEnd = true;
    }
  };

  const Ticker = new class {
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

    setSprites() {
      Background.show();
      Buildings.showAll();
      Character.show();

      this.resizeImages();
      App.render(container);
    }
    resizeImages() {
      Background.resize();
      Character.resizeWrapper();
      Buildings.updateAll();
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
      const filePath = resource.url;
      const totalProgress = loader.progress;
    }

    loadCompleteHandler(loader, resource) {
      if (loader.progress < 100) return;
      this.setSprites();
      AppCreator.createApp();
      Ticker.start();
    }

    loadImages() {
      const loader = PIXI.Loader.shared;

      Object.entries(images).forEach(([imageKey, imageInfo]) => {
        loader.add(imageKey, imageInfo.path);
      });

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