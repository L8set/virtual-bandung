var VirtualBandung = VirtualBandung || {};
VirtualBandung.Play = VirtualBandung.Play || {};

(() => {
  const CONSTS = {
    ELEMENT_ID: {
      AREA: 'playArea',
      CANVAS: 'playCanvas'
    },
    FILE_TYPE: {
      PNG: 1,
      JSON: 2
    },
    Z: {
      FIELD: 1,
      CHARACTER: 5
    },
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
    SCROLL: {
      MAX: 20,
      UNIT: 1
    }
  };

  class ImageInfo {
    constructor(_path, _fileType) {
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
    sky: new ImageInfo('data/img/sky.jpg')
  };

  const containers = VirtualBandung.Play.containers = {
    jpn: null,
    idn: null,
    current: null
  };

  const App = VirtualBandung.Play.app = new class {
    constructor() {
      this._app;
      this._renderer;
    }
    get width() {
      return document.getElementById(CONSTS.ELEMENT_ID.CANVAS).offsetWidth;
    }
    get height() {
      return document.getElementById(CONSTS.ELEMENT_ID.CANVAS).offsetHeight;
    }
    get scale() {
      return this.height / 1920;
    }
    get characterScale() {
      return this.scale * 560 / CONSTS.CHARACTER.HEIGHT;
    }
    get renderer() {
      return this._renderer;
    }
    set renderer(_renderer) {
      this._renderer = _renderer;
    }
    render() {
      this.renderer.render(containers.current);
    }
  };

  const Character = VirtualBandung.Play.character = new class {
    constructor() {
      const wrapper = new PIXI.Sprite();
      wrapper.anchor.set(0.5, 1);
      wrapper.alpha = 1;
      wrapper.zindex = CONSTS.Z.CHARACTER;
      wrapper.scale.set(App.characterScale)
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
      console.log(`${_angle}, ${_pose}, ${sprite._texture.textureCacheIds[0]}`)
      sprite.anchor.set(0.5, 1);
      this.wrapper.addChild(sprite);
      App.render();
    }
    init() {
      this.setSprite(this.angle, this.pose);
      this.wrapper.position.set(App.width / 2, App.height * 3 / 4);
      if (!containers.current.children.includes(this.wrapper)) {
        containers.current.addChild(this.wrapper);
      }
    }
    show() {
      this.init();
    }
    walk() {
      this.pose = (this._pose + 1) % 4;
    }
  };

  const Event = new class {
    constructor() {
      this._currentPosition = 0;
      this._nextPosition = 0;
      this._touching = false;
      this._lastY = 0;
      this._moving = false;
      this._intervalID;
    }
    increment(y) {
      let newPosition = Math.min(this._nextPosition + y, CONSTS.SCROLL.MAX);
      newPosition = Math.max(newPosition, 0)
      this._nextPosition = newPosition;
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
        this._moving = true;
        this._intervalID = setInterval(() => this.move(), 100);
      }
    }
    move() {
      const nextPosition = parseInt(this._nextPosition);
      if (this._currentPosition === nextPosition) {
        clearInterval(this._intervalID);
        this._moving = false;
        setTimeout(() => {Character.pose = CONSTS.CHARACTER.POSE.STAND;}, 100);
        return;
      } else if (this._currentPosition < nextPosition) {
        this._currentPosition = Math.min(this._currentPosition + CONSTS.SCROLL.UNIT, CONSTS.SCROLL.MAX);
        this.moveCharacter(CONSTS.CHARACTER.ANGLE.UP);
        if (this._currentPosition >= nextPosition) {
          this._nextPosition = this._currentPosition;
          setTimeout(() => {Character.pose = CONSTS.CHARACTER.POSE.STAND;}, 100);
        }
      } else {
        this._currentPosition = Math.max(this._currentPosition - CONSTS.SCROLL.UNIT, 0);
        this.moveCharacter(CONSTS.CHARACTER.ANGLE.DOWN);
        if (this._currentPosition <= nextPosition) {
          this._nextPosition = this._currentPosition;
          setTimeout(() => {Character.pose = CONSTS.CHARACTER.POSE.STAND;}, 100);
        }
      }
      this.moveField();
      App.render();
    }
    moveCharacter(angle) {
      Character.angle = angle;
      Character.walk();
    }
    moveField() {
      const sky = images.sky.sprite;
      sky.y = App.height + (sky.height - App.height) * (this._currentPosition / CONSTS.SCROLL.MAX);
    }
  };

  const AppCreator = new class {

    onResize() {
      App.render();
    }

    createApp() {
      const canvas = document.getElementById(CONSTS.ELEMENT_ID.CANVAS);
      const renderer = new PIXI.autoDetectRenderer({
        width: canvas.offsetWidth,
        height: canvas.offsetHeight,
        view: canvas
      });
      window.addEventListener('resize', () => this.onResize());
      window.addEventListener('wheel', (event) => Event.onWheel(event));
      window.addEventListener('touchstart', (event) => Event.onTouchStart(event));
      window.addEventListener('touchmove', (event) => Event.onTouchMove(event));
      window.addEventListener('touchend', (event) => Event.onTouchEnd(event));

      App.renderer = renderer;
    }
  };

  const ImageLoader = new class {

    setSprites() {
      const jpnContainer = new PIXI.Container();
      // jpnContainer.scale.set(App.scale);
      containers.current = containers.jpn = jpnContainer;

      let sprite;

      sprite = images.sky.sprite;
      sprite.zindex = CONSTS.Z.FIELD;
      sprite.position.set(App.width / 2, App.height);
      sprite.scale.set(App.width / 1080);
      sprite.anchor.set(0.5, 1);
      jpnContainer.addChild(sprite);

      Character.show();

      App.renderer.render(jpnContainer);
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

  function init() {
    AppCreator.createApp();
    ImageLoader.loadImages();
  }

  {
    init();
  }
})(this);