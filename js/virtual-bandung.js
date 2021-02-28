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
    Y: {
      CHARACTER: 4/5,
      FAR_POINT: 2/5
    },
    Z: {
      SKY: 1,
      MOON: 2,
      MOUNTAIN: 3,
      CLOUD: 4,
      BG_BUILDINGS: 5,
      GROUND: 6,
      GATE: 7,
      BUILDING: 10,
      CHARACTER: 30
    },
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
      GAP: 1000,
      POSITION: {
        RIGHT: 0,
        CENTER: 0.5,
        LEFT: 1
      }
    },
    TICK_UNIT: 1,
    SCROLL: {
      MAX: 1200,
      UNIT: 100
    },
    FILTER: {
      GLOW: new PIXI.filters.GlowFilter(15, 2, 1, 0xff9999, 0.5)
    }
  };

  const container = VirtualBandung.Play.container = new PIXI.Container();

  const App = VirtualBandung.Play.app = new class {
    constructor() {
      this._app;
      this._renderer = new PIXI.autoDetectRenderer({
        width: window.innerWidth,
        height: window.innerHeight
      });
      this._distance = 0;
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
    get distance() {
      return this._distance;
    }
    set distance(_distance) {
      this._distance = _distance;
    }
    get scale() {
      return this.height / 1080;
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
      return this.height * 4 / 5;
    }
    get buildingOriginY() {
      return this.height * 2 / 5;
    }
    updateSize() {
      this.renderer.resize(this.width, this.height);
    }
    render() {
      this.renderer.render(container);
    }
  };

  class ImageInfo {
    constructor(_path, _type=CONSTS.SPRITE_TYPE.SPRITE, _width=0, _height=0) {
      this._path = _path;
      this._type = _type;
      this._width = _width;
      this._height = _height;
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
      switch (this._type) {
      case CONSTS.SPRITE_TYPE.TILING:
        this.sprite = new PIXI.TilingSprite(_texture, this._width, this._height);
        break;
      case CONSTS.SPRITE_TYPE.SPRITE:
      default:
        this.sprite = new PIXI.Sprite(_texture);
        break;
      }
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
    ground: new ImageInfo('data/img/ground.png'),
    groundMask: new ImageInfo('data/img/ground_mask.jpg'),
    groundGrad: new ImageInfo('data/img/ground_grad.jpg'),
    sky: new ImageInfo('data/img/sky.jpg', CONSTS.SPRITE_TYPE.TILING, 3000, 500),
    cloudA: new ImageInfo('data/img/cloud_a.png'),
    cloudB: new ImageInfo('data/img/cloud_b.png'),
    cloudC: new ImageInfo('data/img/cloud_c.png'),
    moon: new ImageInfo('data/img/moon.png'),
    mountain: new ImageInfo('data/img/mountain.png'),
    gate: new ImageInfo('data/img/gate.png'),
    tower: new ImageInfo('data/img/tower.png'),
    buildingA: new ImageInfo('data/img/building_a.png'),
    buildingB: new ImageInfo('data/img/building_b.png'),
    buildingC: new ImageInfo('data/img/building_c.png'),
    buildingD: new ImageInfo('data/img/building_d.png'),
    shopA: new ImageInfo('data/img/shop_a.png'),
    shopB: new ImageInfo('data/img/shop_b.png'),
    shopC: new ImageInfo('data/img/shop_c.png'),
    shopD: new ImageInfo('data/img/shop_d.png'),
    boothA: new ImageInfo('data/img/booth_a.png'),
    boothB: new ImageInfo('data/img/booth_b.png')
  };

  class Building {
    constructor(imageInfo, index, link) {
      this._imageInfo = imageInfo;
      this._index = index;
      this._link = link;
      this._position = index % 2 === 0 ? CONSTS.BUILDING.POSITION.LEFT : CONSTS.BUILDING.POSITION.RIGHT;

      const sprite = imageInfo.sprite;
      sprite.anchor.set(this._position, 1);
      sprite.zIndex = CONSTS.Z.BUILDING - index;
      sprite.position.set(App);
      sprite.on('pointerover', () => this.onPointerOver(sprite))
      .on('pointerout', () => this.onPointerOut(sprite));
    }
    get sprite() {
      return this._imageInfo.sprite;
    }
    set zIndex(_zIndex) {
      this.sprite.zIndex = _zIndex;
    }
    get position() {
      return this._position;
    }
    set position(_position) {
      this._position = _position;
      this.sprite.anchor.set(this._position, 1);
    }
    get startDistance() {
      return this._index * CONSTS.SCROLL.UNIT;
    }
    get currentDistance() {
      return Math.max(0, App.distance - this.startDistance);
    }
    get distanceAngleTangent() {
      const viewAngleTangent = CONSTS.BUILDING.GAP / CONSTS.VIEW_HEIGHT;
      const distanceRatio = this.currentDistance / CONSTS.SCROLL.UNIT;
      if (distanceRatio < 1) {
        return viewAngleTangent * distanceRatio;
      } else {
        return viewAngleTangent * Math.pow(distanceRatio, 2);
      }
    }
    get exactScale() {
      const viewAngleTangent = CONSTS.BUILDING.GAP / CONSTS.VIEW_HEIGHT;
      return this.distanceAngleTangent / viewAngleTangent;
    }
    get scale() {
      const distance = (App.distance - this.startDistance) / CONSTS.SCROLL.UNIT;
      let smallestScale = (1 + this.exactScale) / 6;
      if (distance < 0) {
        smallestScale -= Math.abs(distance / 8) / 12;
      }
      const peekScale = 1.1;
      return App.scale * ((peekScale - smallestScale) * this.exactScale + smallestScale);
    }
    get x() {
      const origin = App.originX;
      const delta = CONSTS.ROAD_WIDTH * this.exactScale;
      switch (this._position) {
      case CONSTS.BUILDING.POSITION.LEFT:
        return origin - delta;
      case CONSTS.BUILDING.POSITION.RIGHT:
        return origin + delta;
      case CONSTS.BUILDING.POSITION.CENTER:
      default:
        return origin;
      }
    }
    get y() {
      const origin = App.buildingOriginY;
      const distanceRange = App.height * (CONSTS.Y.CHARACTER - CONSTS.Y.FAR_POINT);
      const delta = distanceRange * (
        this.exactScale <= 1 ? this.exactScale
        : this.position !== CONSTS.BUILDING.POSITION.CENTER ? Math.pow(this.exactScale, 2)
        : 1 + (this.exactScale - 1) * 0.1
      );
      return origin + delta;
    }
    updateFilters() {
      if (this.exactScale > 0.9 && this.exactScale < 1.1) {
        this.sprite.filters = [CONSTS.FILTER.GLOW];
      } else {
        this.sprite.filters = [];
      }
    }
    updatePosition() {
      const sprite = this.sprite;
      sprite.position.set(this.x, this.y);
      sprite.scale.set(this.scale);
      this.updateFilters();
    }
  }

  const Background = new class {
    constructor() {
      const wrapper = this._wrapper = new PIXI.Sprite();
      wrapper.anchor.set(0.5, 1);
      wrapper.scale.set(App.scale);
    }
    get wrapper() {
      return this._wrapper;
    }
    setSprites() {
      const wrapper = this.wrapper;
      const sky = images.sky.sprite;
      sky.anchor.set(0.5, 0);
      sky.zIndex = CONSTS.Z.SKY;
      wrapper.addChild(sky);
      const moon = images.moon.sprite;
      moon.anchor.set(0.5);
      moon.zIndex = CONSTS.Z.MOON;
      wrapper.addChild(moon);
      const cloudA = images.cloudA.sprite;
      cloudA.anchor.set(0.5);
      cloudA.zIndex = CONSTS.Z.CLOUD;
      wrapper.addChild(cloudA);
      const cloudB = images.cloudB.sprite;
      cloudB.anchor.set(0.5);
      cloudB.zIndex = CONSTS.Z.CLOUD;
      wrapper.addChild(cloudB);
      const cloudC = images.cloudC.sprite;
      cloudC.anchor.set(0.5);
      cloudC.zIndex = CONSTS.Z.CLOUD;
      wrapper.addChild(cloudC);
      const mountain = images.mountain.sprite;
      mountain.anchor.set(0.5, 1);
      mountain.zIndex = CONSTS.Z.MOUNTAIN;
      wrapper.addChild(mountain);
      const ground = images.groundGrad.sprite;
      ground.scale.set(2);
      ground.anchor.set(0.5);
      wrapper.addChild(ground);
      const groundMask = images.groundMask.sprite;
      groundMask.anchor.set(0.5, 1);
      ground.mask = groundMask;
      wrapper.addChild(groundMask);
    }
    resizeWrapper() {
      this.wrapper.position.set(App.width / 2, App.characterOriginY);
      this.wrapper.scale.set(App.scale);
      this.init();
    }
    init() {
      const wrapper = this.wrapper;
      wrapper.position.set(App.width / 2, App.height);
      const width = App.width / App.scale;
      const height = App.height / App.scale;
      const sky = images.sky.sprite;
      sky.position.set(0, - height);
      const mountain = images.mountain.sprite;
      mountain.position.set(width / 4, - height * 0.6)
      this.moveMoon();
      const ground = images.groundGrad.sprite;
      ground.position.set(0, - height * 0.6);
      const groundMask = images.groundMask.sprite;
      groundMask.position.set(0);
      groundMask.scale.set(width / 1980, height / 654 * 0.75);
    }
    moveSky() {
      images.sky.sprite.tilePosition.x += 0.2;
      App.render();
    }
    moveMoon() {
      const moon = images.moon.sprite;
      const width = App.width / App.scale;
      const height = App.height / App.scale;
      const radius = width / 2 * 1.2;
      const topY = - height * 0.95;
      const bottomY = - height * 0.6;
      const originX = 0;
      const originY = topY + radius;
      const speedUnit = Math.PI / 4000;
      const {x: currX} = moon;
      const currAngle = Math.acos(currX / radius);
      let nextAngle = currAngle - speedUnit;
      let nextX = originX + radius * Math.cos(nextAngle);
      let nextY = originY - radius * Math.sin(nextAngle);
      if (nextY > bottomY) {
        nextX = - width / 2;
      }
      moon.position.set(nextX, nextY);
      App.render();
    }
    moveGround() {
      const ground = images.groundGrad.sprite;
      ground.rotation += 0.1;
    }
    tick(ticker) {
      if (ticker % 5 === 0) {
        this.moveMoon();
        this.moveSky();
      }
    }
    show() {
      this.setSprites();
      this.init();
      container.addChild(this.wrapper);
    }
  };

  const Character = VirtualBandung.Play.character = new class {
    constructor() {
      const wrapper = new PIXI.Sprite();
      wrapper.anchor.set(0.5, 1);
      wrapper.alpha = 1;
      wrapper.zIndex = CONSTS.Z.CHARACTER;
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
      App.render();
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
    init() {
      this._buildings = [
        [images.buildingA, ''],
        [images.boothA, ''],
        [images.shopA, ''],
        [images.buildingB, ''],
        [images.shopB, ''],
        [images.buildingC, ''],
        [images.shopC, ''],
        [images.boothB, ''],
        [images.buildingD, ''],
        [images.shopD, '']
      ]
      .map(([imageInfo, link], index) => new Building(imageInfo, index, link));

      const gate = new Building(images.gate, 10);
      gate.position = CONSTS.BUILDING.POSITION.CENTER;
      gate.zIndex = CONSTS.Z.GATE;
      this._buildings.push(gate);
    }
    showAll() {
      if (this._buildings.length === 0) {
        this.init();
      }
      this._buildings.reverse().forEach(building => {
        building.updatePosition();
        container.addChild(building.sprite);
      });
    }
    updateAll() {
      this._buildings.forEach(building => building.updatePosition());
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
      Background.resizeWrapper();
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

      this.setSprites();
    }

    loadProgressHandler(loader, resource) {
      const filePath = resource.url;
      const totalProgress = loader.progress;
    }

    loadImages() {
      const loader = PIXI.Loader.shared;

      Object.entries(images).forEach(([imageKey, imageInfo]) => {
        loader.add(imageKey, imageInfo.path);
      });

      loader.load((_loader, _resources) => this.onLoadImages(_resources));
      loader.onProgress.add((_loader, _resource) => this.loadProgressHandler(_loader, _resource));
      loader.onComplete.add(() => Ticker.start());
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
    increment(y) {
      let newPosition = Math.min(this._nextPosition + y, CONSTS.SCROLL.MAX);
      newPosition = Math.max(newPosition, 0)
      this._nextPosition = newPosition;
    }
    roundPosition() {
      this._nextPosition = Math.min(Math.ceil(this._nextPosition / 100) * 100, CONSTS.SCROLL.MAX);
    }
    onResize() {
      App.updateSize();
      ImageLoader.resizeImages();
      App.render();
    }
    onWheel(event) {
      if (!this.playable) return;
      if (event.deltaY > 0) {
        this.increment(100);
      } else {
        this.increment(-100);
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
        if (ticker % 20 === 0) this.moveCharacter();
      }
      if (this._moving) {
        this.move();
        this.moveBuildings();
      }
    }
    move() {
      const delta = this.nextPosition - App.distance;
      const deltaRatio = Math.abs(0.5 - Math.abs(delta / CONSTS.SCROLL.MAX));
      let unit = CONSTS.TICK_UNIT * (deltaRatio < 0.1 ? 1 : Math.pow((0.5 - deltaRatio) * 10, 2));
      unit = Math.max(unit, 0.5);
      if (delta === 0) {
        App.distance = this.nextPosition;
        this._moving = false;
      } else if (delta > 0) {
        const distance = Math.min(App.distance + unit, CONSTS.SCROLL.MAX);
        App.distance = (distance >= this.nextPosition) ? this.nextPosition : distance;
      } else {
        const distance = Math.max(App.distance - unit, 0);
        App.distance = (distance <= this.nextPosition) ? this.nextPosition : distance;
      }
      App.render();
      if (parseInt(App.distance) === CONSTS.SCROLL.MAX) {
        this.onReachEnd();
      }
    }
    moveCharacter() {
      if (!this._moving) {
        Character.stop();
        this._walking = false;
        return;
      }
      const building = (App.distance / CONSTS.SCROLL.UNIT) * 10;
      if (building > 5 && building < 105 && (building % 10 > 8 || building % 10 < 2)) {
        if (Math.round(building / 10) % 2 === 0) {
          Character.angle = CONSTS.CHARACTER.ANGLE.RIGHT;
        } else {
          Character.angle = CONSTS.CHARACTER.ANGLE.LEFT;
        }
      } else if (App.distance < this.nextPosition && Character.angle !== CONSTS.CHARACTER.ANGLE.UP) {
        Character.angle = CONSTS.CHARACTER.ANGLE.UP;
      } else if (App.distance > this.nextPosition && Character.angle !== CONSTS.CHARACTER.ANGLE.DOWN) {
        Character.angle = CONSTS.CHARACTER.ANGLE.DOWN;
      }
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
      this._tick = 0;
      this._intervalID = 0;
    }
    ticker() {
      Event.tick(this._tick);
      Background.tick(this._tick);
      this._tick++;
    }
    start() {
      if (this._intervalID > 0) return;
      this._intervalID = setInterval(() => this.ticker(), 5);
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

  VirtualBandung.Play.init = function() {
    AppCreator.createApp();
    ImageLoader.loadImages();
  };

  VirtualBandung.Play.start = function() {
    Event.playable = true;
  };

  {
    VirtualBandung.Play.init();
  }
})(this);