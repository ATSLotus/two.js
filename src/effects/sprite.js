(function(Two) {

  var _ = Two.Utils;
  var Path = Two.Path;
  var Rectangle = Two.Rectangle;

  var Sprite = Two.Sprite = function(path, ox, oy, cols, rows, frameRate) {

    Path.call(this, [
      new Two.Anchor(),
      new Two.Anchor(),
      new Two.Anchor(),
      new Two.Anchor()
    ], true);

    if (path instanceof Two.Texture) {
      this.texture = path;
    } else if (_.isString(path)) {
      this.texture = new Two.Texture(path);
    }

    this.noStroke();

    this._update();
    this.translation.set(ox, oy);

    if (_.isNumber(cols)) {
      this.columns = cols;
    }
    if (_.isNumber(rows)) {
      this.rows = rows;
    }
    if (_.isNumber(frameRate)) {
      this.frameRate = frameRate;
    }

  };

  _.extend(Sprite, {

    Properties: [
      'texture', 'columns', 'rows', 'frameRate'
    ],

    MakeObservable: function(obj) {

      Rectangle.MakeObservable(obj);
      _.each(Sprite.Properties, Two.Utils.defineProperty, obj);

    }

  })

  _.extend(Sprite.prototype, Rectangle.prototype, {

    _flagTexture: false,
    _flagColumns: false,
    _flagRows: false,
    _flagFrameRate: false,

    // Private variables
    _amount: 1,
    _duration: 0,
    _index: 0,
    _startTime: 0,
    _playing: false,
    _firstFrame: 0,
    _lastFrame: 0,
    _loop: true,

    // Exposed through getter-setter
    _texture: null,
    _columns: 1,
    _rows: 1,
    _frameRate: 0,

    play: function(firstFrame, lastFrame) {

      this._playing = true;
      this._firstFrame = 0;
      this._lastFrame = 0;
      this._startTime = _.performance.now();

      if (_.isNumber(firstFrame)) {
        this._firstFrame = firstFrame;
      }
      if (_.isNumber(lastFrame)) {
        this._lastFrame = lastFrame;
      }

      return this;

    },

    pause: function() {

      this._playing = false;
      return this;

    },

    stop: function() {

      this._playing = false;
      this._index = 0;

      return this;

    },

    _update: function() {

      var effect = this._texture;
      var cols = this._columns;
      var rows = this._rows;

      var width, height, elapsed, amount, duration;
      var index, iw, ih, isRange;

      if (this._flagColumns || this._flagRows) {
        this._amount = this._columns * this._rows;
      }

      if (this._flagFrameRate) {
        this._duration = 1000 * this._amount / this._frameRate;
      }

      if (this._flagTexture) {
        this.fill = this._texture;
      }

      if (this._texture.loaded) {

        iw = effect.image.width;
        ih = effect.image.height;

        width = iw / cols;
        height = ih / rows;
        amount = this._amount;

        if (this.width !== width) {
          this.width = width;
        }
        if (this.height !== height) {
          this.height = height;
        }

        if (this._playing && this._frameRate > 0) {

          // TODO: Offload perf logic to instance of `Two`.
          elapsed = _.performance.now() - this._startTime;
          duration = this._duration;
          isRange = this._firstFrame >= 0 && this._lastFrame > 0;

          if (isRange) {
            duration = 1000 * (this._lastFrame - this._firstFrame)
              / this._frameRate;
          }

          if (this._loop) {
            elapsed = elapsed % duration;
          } else {
            elapsed = Math.min(elapsed, duration);
          }

          if (isRange) {
            index = _.lerp(this._firstFrame, this._lastFrame, elapsed / duration);
          } else {
            index = _.lerp(0, amount - 1, elapsed / duration);
          }

          index = Math.floor(index);

          if (index !== this._index) {
            this._index = index;
          }

        }

        var ox = (iw - width) / 2 + width * ((this._index % cols) + 1);
        var oy = height * Math.floor((this._index / cols))
          - (ih - height) / 2;

        // TODO: Improve performance
        if (ox !== effect.offset.x) {
          effect.offset.x = ox;
        }
        if (oy !== effect.offset.y) {
          effect.offset.y = oy;
        }

      }

      Rectangle.prototype._update.call(this);

      return this;

    },

    flagReset: function() {

      this._flagTexture = this._flagColumns = this._flagRows
        = this._flagFrameRate = false;

      Rectangle.prototype.flagReset.call(this);

      return this;
    }


  });

  Sprite.MakeObservable(Sprite.prototype);

  function map(v, a, b, c, d) {
    return (d - c) * (v - a) / (b - a) + c;
  }

  function cmap(v, a, b, c, d) {
    return Math.min(Math.max((d - c) * (v - a) / (b - a) + c, c), y2);
  }

  function clamp(v, a, b) {
    return Math.min(Math.max(v, a), b);
  }

})((typeof global !== 'undefined' ? global : this).Two);