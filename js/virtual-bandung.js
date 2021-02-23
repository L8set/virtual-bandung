var VirtualBandung = VirtualBandung || {};
VirtualBandung.Play = VirtualBandung.Play || {};

(() => {
  const CONSTS = {
    ELEMENT_ID: {
      AREA: 'playArea',
      WRAPPER: 'playWrapper'
    },
    FILE_TYPE: {
      PNG: 1,
      JSON: 2
    },
    Y: {
      CHARACTER: 4/5,
      FAR_POINT: 2/5
    },
    Z: {
      FIELD: 1,
      CHARACTER: 30,
      BUILDING_MAX: 20
    },
    VIEW_HEIGHT: 10,
    BUILDING_GAP: 1000,
    ROAD_WIDTH: 8,
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
    TICK_UNIT: 1,
    SCROLL: {
      MAX: 2000,
      UNIT: 100
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
      this.view.width = this.width;
      this.view.height = this.height;
      this.view.style.width = `${this.width}px`;
      this.view.style.height = `${this.height}px`;
    }
    render() {
      this.renderer.render(container);
    }
  };

  class ImageInfo {
    constructor(_path) {
      this._path = _path;
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
    getSprite(key = 0) {
      return this._sprites.get(key);
    }
    setSprite(key, _sprite) {
      this._sprites.set(key, _sprite);
    }
  }

  const images = VirtualBandung.Play.images = {
    character: new ImageInfo('data/img/character.json'),
    jpnField: new ImageInfo('data/img/jpn_field.jpg'),
    sky: new ImageInfo('data/img/sky.jpg'),
    mountain: new ImageInfo('data/img/mountain.png'),
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
      this._leftSideFlg = index % 2 === 0;

      const sprite = imageInfo.sprite;
      sprite.zIndex = CONSTS.Z.BUILDING_MAX - index;
      sprite.position.set(App);
    }
    get sprite() {
      return this._imageInfo.sprite;
    }
    get startDistance() {
      return this._index * CONSTS.SCROLL.UNIT;
    }
    get currentDistance() {
      return Math.max(0, App.distance - this.startDistance);
    }
    get distanceAngleTangent() {
      const viewAngleTangent = CONSTS.BUILDING_GAP / CONSTS.VIEW_HEIGHT;
      const distanceRatio = this.currentDistance / CONSTS.SCROLL.UNIT;
      let result;
      if (distanceRatio <= 0) {
        result = 0;
      } else if (distanceRatio < 1) {
        const sqrt = Math.sqrt(1 - 4 * distanceRatio * Math.pow(viewAngleTangent, 2) * (distanceRatio - 1));
        result = (sqrt - 1) / (2 * distanceRatio * viewAngleTangent);
      } else {
        result = Math.pow(viewAngleTangent * distanceRatio, 2);
      }
      return result;
    }
    get exactScale() {
      const viewAngleTangent = CONSTS.BUILDING_GAP / CONSTS.VIEW_HEIGHT;
      return this.distanceAngleTangent / viewAngleTangent;
    }
    get scale() {
      const smallestScale = 1 / 48;
      return App.scale * ((1 - smallestScale) * this.exactScale + smallestScale);
    }
    get x() {
      const origin = App.originX;
      const distanceRange = App.height * (CONSTS.Y.CHARACTER - CONSTS.Y.FAR_POINT);
      const base = CONSTS.ROAD_WIDTH / 2;
      const tangent = base / distanceRange;
      const delta = tangent * this.exactScale;
      return this._leftSideFlg ? origin - delta : origin + delta;
    }
    get y() {
      const origin = App.buildingOriginY;
      const distanceRange = App.height * (CONSTS.Y.CHARACTER - CONSTS.Y.FAR_POINT);
      const delta = distanceRange * this.exactScale;
      return origin + delta;
    }
    updatePosition() {
      const sprite = this.sprite;
      sprite.anchor.set(this._leftSideFlg ? 1 : 0, 1);
      sprite.position.set(this.x, this.y);
      sprite.scale.set(this.scale);
    }
  }

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
        [images.buildingB, ''],
        [images.buildingC, ''],
        [images.buildingD, ''],
        [images.shopA, ''],
        [images.shopB, ''],
        [images.shopC, ''],
        [images.shopD, ''],
        [images.boothA, ''],
        [images.boothB, '']
      ]
      .map(([imageInfo, link], index) => new Building(imageInfo, index, link));
    }
    showAll() {
      if (this._buildings.length === 0) {
        this.init();
      }
      this._buildings.forEach(building => {
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
      const field = images.sky.sprite;
      field.zIndex = CONSTS.Z.FIELD;
      field.anchor.set(0.5, 1);
      container.addChild(field);

      Character.show();
      Buildings.showAll();

      this.resizeImages();
      App.render(container);
    }
    resizeImages() {
      const field = images.sky.sprite;
      field.position.set(App.width / 2, App.height);
      field.scale.set(App.scale, 1);

      Character.resizeWrapper();
      Buildings.updateAll();
    }
    onLoadImages(resources) {
      let textures;

      Object.entries(resources).forEach(([imageKey, resource]) => {

        if (images.hasOwnProperty(imageKey)) {
          textures = resource.textures;

          if (!textures) {
            images[imageKey].sprite = new PIXI.Sprite(resource.texture);
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
      console.log("loading: " + resource.url);
      console.log("progress: " + loader.progress + "%");
    }

    loadImages() {
      const loader = PIXI.Loader.shared;

      Object.entries(images).forEach(([imageKey, imageInfo]) => {
        loader.add(imageKey, imageInfo.path);
      });

      loader.onProgress.add((_loader, _resource) => this.loadProgressHandler(_loader, _resource));
      loader.load((_loader, _resources) => this.onLoadImages(_resources));
    }
  };

  const Event = new class {
    constructor() {
      this._nextPosition = 0;
      this._touching = false;
      this._lastY = 0;
      this._moving = false;
      this.intervalID = {
        tick: 0,
        character: 0,
        buildings: 0,
        road: 0
      };
    }
    get nextPosition() {
      return parseInt(this._nextPosition);
    }
    increment(y) {
      let newPosition = Math.min(this._nextPosition + y, CONSTS.SCROLL.MAX);
      newPosition = Math.max(newPosition, 0)
      this._nextPosition = newPosition;
    }
    onResize() {
      App.updateSize();
      ImageLoader.resizeImages();
      App.render();
    }
    onWheel(event) {
      this.increment(event.deltaY / 100);
      if (!this._moving) {
        this.startMoving();
      }
    }
    onTouchStart(event) {
      const touch = event.touches[0];
      this._touching = true;
      this._lastY = touch.screenY;
      if (!this._moving) {
        this.startMoving();
      }
    }
    onTouchMove(event) {
      const touch = event.touches[0];
      const currentY = touch.screenY;
      this.increment((currentY - this._lastY) / 10);
      this._lastY = touch.screenY;
      if (!this._moving) {
        this.startMoving();
      }
    }
    onTouchEnd(event) {
      this._touching = false;
    }
    startMoving() {
      if (!this._moving) {
        this.startMove();
      }
    }
    startMove() {
      this._moving = true;
      this.intervalID.tick = setInterval(() => this.tick(), 1);
      this.intervalID.character = setInterval(() => this.moveCharacter(), 100);
      this.intervalID.buildings = setInterval(() => this.moveBuildings(), 1);
      this.intervalID.field = setInterval(() => this.moveField(), 10);
    }
    tick() {
      if (App.distance === this.nextPosition) {
        clearInterval(this.intervalID.tick);
        this._moving = false;
      } else if (App.distance < this.nextPosition) {
        App.distance = parseInt(Math.min(App.distance + CONSTS.TICK_UNIT, CONSTS.SCROLL.MAX));
      } else {
        App.distance = parseInt(Math.max(App.distance - CONSTS.TICK_UNIT, 0));
      }
      App.render();
    }
    moveCharacter() {
      if (!this._moving) {
        Character.stop();
        clearInterval(this.intervalID.character);
        return;
      }
      if (App.distance < this.nextPosition && Character.angle !== CONSTS.CHARACTER.ANGLE.UP) {
        Character.angle = CONSTS.CHARACTER.ANGLE.UP;
      } else if (Character.angle !== CONSTS.CHARACTER.ANGLE.DOWN) {
        Character.angle = CONSTS.CHARACTER.ANGLE.DOWN;
      }
      Character.walk();
    }
    moveBuildings() {
      if (!this._moving) {
        clearInterval(this.intervalID.buildings);
        return;
      }
      Buildings.updateAll();
    }
    moveField() {
      if (!this._moving) {
        clearInterval(this.intervalID.field);
        return;
      }
      const sky = images.sky.sprite;
      sky.y = App.height + (sky.height - App.height) * (App.distance / CONSTS.SCROLL.MAX);
    }
  };

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
  }

  {
    VirtualBandung.Play.init();
  }
})(this);