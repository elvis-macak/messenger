// Generated by CoffeeScript 1.3.3
(function() {
  var $, ActionMessenger, MagicMessage, Message, Messenger,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  $ = jQuery;

  Message = (function(_super) {

    __extends(Message, _super);

    function Message() {
      return Message.__super__.constructor.apply(this, arguments);
    }

    Message.prototype.defaults = {
      hideAfter: 10,
      scroll: true
    };

    Message.prototype.initialize = function(opts) {
      if (opts == null) {
        opts = {};
      }
      this.shown = false;
      this.rendered = false;
      this.messenger = opts.messenger;
      return this.options = $.extend({}, this.options, opts, this.defaults);
    };

    Message.prototype.show = function() {
      var wasShown;
      this.render();
      this.$message.show();
      wasShown = this.shown;
      this.shown = true;
      if (!wasShown) {
        return this.trigger('show');
      }
    };

    Message.prototype.hide = function() {
      var wasShown;
      this.$message.hide();
      wasShown = this.shown;
      this.shown = false;
      if (wasShown) {
        return this.trigger('hide');
      }
    };

    Message.prototype.cancel = function() {
      return this.hide();
    };

    Message.prototype.update = function(opts) {
      var _ref,
        _this = this;
      $.extend(this.options, opts);
      this.lastUpdate = new Date();
      this.rendered = false;
      this.events = (_ref = this.options.events) != null ? _ref : {};
      this.render();
      this.actionsToEvents();
      this.delegateEvents();
      this.checkClickable();
      if (this.options.hideAfter) {
        if (this._hideTimeout != null) {
          clearTimeout(this._hideTimeout);
        }
        this._hideTimeout = setTimeout(function() {
          return _this.hide();
        }, this.options.hideAfter * 1000);
      }
      if (this.options.hideOnNavigate) {
        if (Backbone.history != null) {
          return Backbone.history.on('route', function() {
            return _this.hide();
          });
        }
      }
    };

    Message.prototype.scrollTo = function() {
      if (!this.options.scroll) {
        return;
      }
      return $.scrollTo(this.$el, {
        duration: 400,
        offset: {
          left: 0,
          top: -20
        }
      });
    };

    Message.prototype.timeSinceUpdate = function() {
      if (this.lastUpdate) {
        return (new Date) - this.lastUpdate;
      } else {
        return null;
      }
    };

    Message.prototype.actionsToEvents = function() {
      var act, name, _ref, _results;
      _ref = this.options.actions;
      _results = [];
      for (name in _ref) {
        act = _ref[name];
        _results.push(this.events["click a[data-action=\"" + name + "\"]"] = (function(act) {
          var _this = this;
          return function(e) {
            e.preventDefault();
            e.stopPropagation();
            return act.action(e);
          };
        })(act));
      }
      return _results;
    };

    Message.prototype.checkClickable = function() {
      var evt, name, _ref, _results;
      _ref = this.events;
      _results = [];
      for (name in _ref) {
        evt = _ref[name];
        if (name === 'click') {
          _results.push(this.$el.addClass('clickable'));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Message.prototype.undelegateEvents = function() {
      Message.__super__.undelegateEvents.apply(this, arguments);
      return this.$el.removeClass('clickable');
    };

    Message.prototype.parseActions = function() {
      var act, actions, n_act, name, _ref, _ref1, _ref2;
      actions = [];
      _ref1 = (_ref = this.options.actions) != null ? _ref : [];
      for (name in _ref1) {
        act = _ref1[name];
        n_act = $.extend({}, act);
        n_act.name = name;
        if ((_ref2 = n_act.label) == null) {
          n_act.label = name;
        }
        actions.push(n_act);
      }
      return actions;
    };

    Message.prototype.template = function(opts) {
      var $action, $actions, $cancel, $link, $message, $text, action, _i, _len, _ref,
        _this = this;
      $message = $("<div class='message alert " + opts.type + " alert-" + opts.type + "'>");
      if (opts.showCloseButton) {
        $cancel = $('<button type="button" class="close" data-dismiss="alert">&times;</button>');
        $cancel.click(function() {
          _this.cancel();
          return true;
        });
        $message.append($cancel);
      }
      $text = $("<div>" + opts.message + "</div>");
      $message.append($text);
      $actions = $('<div class="actions">');
      _ref = opts.actions;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        action = _ref[_i];
        $action = $('<span>');
        $link = $('<a>');
        $link.attr('data-action', "" + action.name);
        $link.html(action.label);
        $action.append($('<span class="phrase">'));
        $action.append($link);
        $actions.append($action);
      }
      $message.append($actions);
      return $message;
    };

    Message.prototype.render = function() {
      var opts;
      if (this.rendered) {
        return;
      }
      if (!this._hasSlot) {
        this.setElement(this.messenger._reserveMessageSlot(this));
        this._hasSlot = true;
      }
      opts = $.extend({}, this.options, {
        actions: this.parseActions()
      });
      this.$message = $(this.template(opts));
      this.$el.html(this.$message);
      this.shown = true;
      this.rendered = true;
      return this.trigger('render');
    };

    return Message;

  })(Backbone.View);

  MagicMessage = (function(_super) {

    __extends(MagicMessage, _super);

    function MagicMessage() {
      return MagicMessage.__super__.constructor.apply(this, arguments);
    }

    MagicMessage.prototype.initialize = function() {
      MagicMessage.__super__.initialize.apply(this, arguments);
      return this._timers = {};
    };

    MagicMessage.prototype.cancel = function() {
      this.clearTimers();
      this.hide();
      if ((this._actionInstance != null) && (this._actionInstance.abort != null)) {
        return this._actionInstance.abort();
      }
    };

    MagicMessage.prototype.clearTimers = function() {
      var name, timer, _ref, _results;
      _ref = this._timers;
      _results = [];
      for (name in _ref) {
        timer = _ref[name];
        _results.push(clearTimeout(timer));
      }
      return _results;
    };

    MagicMessage.prototype.render = function() {
      var action, name, _ref, _results;
      MagicMessage.__super__.render.apply(this, arguments);
      this.clearTimers();
      _ref = this.options.actions;
      _results = [];
      for (name in _ref) {
        action = _ref[name];
        if (action.auto) {
          _results.push(this.startCountdown(name, action));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    MagicMessage.prototype.renderPhrase = function(action, time) {
      var phrase;
      phrase = action.phrase.replace('TIME', this.formatTime(time));
      return phrase;
    };

    MagicMessage.prototype.formatTime = function(time) {
      var pluralize;
      pluralize = function(num, str) {
        num = Math.floor(num);
        if (num !== 1) {
          str = str + 's';
        }
        return 'in ' + num + ' ' + str;
      };
      if (Math.floor(time) === 0) {
        return 'now...';
      }
      if (time < 60) {
        return pluralize(time, 'second');
      }
      time /= 60;
      if (time < 60) {
        return pluralize(time, 'minute');
      }
      time /= 60;
      return pluralize(time, 'hour');
    };

    MagicMessage.prototype.startCountdown = function(name, action) {
      var $phrase, remaining, tick, _ref,
        _this = this;
      $phrase = this.$el.find("[data-action='" + name + "'] .phrase");
      remaining = (_ref = action.delay) != null ? _ref : 3;
      tick = function() {
        remaining -= 1;
        $phrase.text(_this.renderPhrase(action, remaining));
        if (remaining > 0) {
          return _this._timers[name] = setTimeout(tick, 1000);
        } else {
          delete _this._timers[name];
          return action.action();
        }
      };
      return tick();
    };

    return MagicMessage;

  })(Message);

  Messenger = (function(_super) {

    __extends(Messenger, _super);

    function Messenger() {
      return Messenger.__super__.constructor.apply(this, arguments);
    }

    Messenger.prototype.tagName = 'ul';

    Messenger.prototype.OPT_DEFAULTS = {
      type: 'info'
    };

    Messenger.prototype.initialize = function(options) {
      return this.history = [];
    };

    Messenger.prototype.findById = function(id) {
      return _.filter(this.history, function(rec) {
        return rec.msg.options.id === id;
      });
    };

    Messenger.prototype._reserveMessageSlot = function(msg) {
      var $slot;
      $slot = $('<li>');
      $slot.addClass('message-slot');
      this.$el.prepend($slot);
      this.history.push({
        msg: msg,
        $slot: $slot
      });
      return $slot;
    };

    Messenger.prototype.newMessage = function(opts) {
      var msg,
        _this = this;
      if (opts == null) {
        opts = {};
      }
      opts.messenger = this;
      msg = new MagicMessage(opts);
      msg.on('show', function() {
        if (opts.scrollTo && _this.$el.css('position') !== 'fixed') {
          return msg.scrollTo();
        }
      });
      msg.on('hide show render', this.updateMessageSlotClasses, this);
      return msg;
    };

    Messenger.prototype.updateMessageSlotClasses = function() {
      var last, rec, willBeFirst, _i, _len, _ref;
      willBeFirst = true;
      last = null;
      _ref = this.history;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        rec = _ref[_i];
        rec.$slot.removeClass('first last shown');
        if (rec.msg.shown && rec.msg.rendered) {
          rec.$slot.addClass('shown');
          last = rec;
          if (willBeFirst) {
            willBeFirst = false;
            rec.$slot.addClass('first');
          }
        }
      }
      if (last != null) {
        return last.$slot.addClass('last');
      }
    };

    Messenger.prototype.hideAll = function() {
      var rec, _i, _len, _ref, _results;
      _ref = this.history;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        rec = _ref[_i];
        _results.push(rec.msg.hide());
      }
      return _results;
    };

    Messenger.prototype.post = function(opts) {
      var msg;
      if (_.isString(opts)) {
        opts = {
          message: opts
        };
      }
      opts = $.extend(true, {}, this.OPT_DEFAULTS, opts);
      msg = this.newMessage(opts);
      msg.update(opts);
      msg.show();
      return msg;
    };

    return Messenger;

  })(Backbone.View);

  ActionMessenger = (function(_super) {

    __extends(ActionMessenger, _super);

    function ActionMessenger() {
      return ActionMessenger.__super__.constructor.apply(this, arguments);
    }

    ActionMessenger.prototype.ACTION_DEFAULTS = {
      progressMessage: null,
      successMessage: null,
      errorMessage: "Error connecting to the server.",
      showSuccessWithoutError: true,
      retry: {
        auto: true,
        allow: true
      },
      action: $.ajax
    };

    ActionMessenger.prototype.hookBackboneAjax = function(msgr_opts) {
      var _ajax, _old_sync,
        _this = this;
      if (msgr_opts == null) {
        msgr_opts = {};
      }
      msgr_opts = _.defaults(msgr_opts, {
        id: 'BACKBONE_ACTION',
        errorMessage: false,
        successMessage: "Request completed successfully.",
        showSuccessWithoutError: false
      });
      _ajax = function(opts) {
        if ($('html').hasClass('ie9-and-less')) {
          opts.cache = false;
        }
        return _this["do"](msgr_opts, opts);
      };
      if (Backbone.ajax != null) {
        return Backbone.ajax = _ajax;
      } else {
        _old_sync = Backbone.sync;
        return Backbone.sync = function(method, model, options) {
          var _old_ajax;
          _old_ajax = $.ajax;
          $.ajax = _ajax;
          if (options.messenger != null) {
            _.extend(msgr_opts, options.messenger);
          }
          _old_sync.call(Backbone, method, model, options);
          return $.ajax = _old_ajax;
        };
      }
    };

    ActionMessenger.prototype._getMessage = function(returnVal, def) {
      if (returnVal === false) {
        return false;
      }
      if (returnVal === true || !(returnVal != null) || typeof returnVal !== 'string') {
        return def;
      }
      return returnVal;
    };

    ActionMessenger.prototype._parseEvents = function(events) {
      var desc, firstSpace, func, label, out, type, _ref;
      if (events == null) {
        events = {};
      }
      out = {};
      for (label in events) {
        func = events[label];
        firstSpace = label.indexOf(' ');
        type = label.substring(0, firstSpace);
        desc = label.substring(firstSpace + 1);
        if ((_ref = out[type]) == null) {
          out[type] = {};
        }
        out[type][desc] = func;
      }
      return out;
    };

    ActionMessenger.prototype._normalizeResponse = function() {
      var data, elem, resp, type, xhr, _i, _len;
      resp = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      type = null;
      xhr = null;
      data = null;
      for (_i = 0, _len = resp.length; _i < _len; _i++) {
        elem = resp[_i];
        if (elem === 'success' || elem === 'timeout' || elem === 'abort') {
          type = elem;
        } else if (((elem != null ? elem.readyState : void 0) != null) && ((elem != null ? elem.responseText : void 0) != null)) {
          xhr = elem;
        } else if (_.isObject(elem)) {
          data = elem;
        }
      }
      return [type, data, xhr];
    };

    ActionMessenger.prototype["do"] = function() {
      var args, events, m, m_opts, msg, opts, _i, _len, _ref, _ref1,
        _this = this;
      m_opts = arguments[0], opts = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      if (opts == null) {
        opts = {};
      }
      m_opts = $.extend(true, {}, this.ACTION_DEFAULTS, m_opts != null ? m_opts : {});
      events = this._parseEvents(m_opts.events);
      if (!m_opts.messageInstance && m_opts.id) {
        _ref = this.findById(m_opts.id);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          m = _ref[_i];
          if (m_opts.singleton) {
            return false;
          } else {
            m.hide();
          }
        }
      }
      msg = (_ref1 = m_opts.messageInstance) != null ? _ref1 : this.newMessage(m_opts);
      if (m_opts.id != null) {
        msg.opts.id = m_opts.id;
      }
      if (m_opts.progressMessage != null) {
        msg.update($.extend({}, m_opts, {
          message: m_opts.progressMessage,
          type: 'info'
        }));
      }
      _.each(['error', 'success'], function(type) {
        var old, _ref2;
        old = (_ref2 = opts[type]) != null ? _ref2 : function() {};
        return opts[type] = function() {
          var data, msgOpts, msgText, r, reason, resp, xhr, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
          resp = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          _ref3 = _this._normalizeResponse.apply(_this, resp), reason = _ref3[0], data = _ref3[1], xhr = _ref3[2];
          if (type === 'success' && !(msg.errorCount != null) && m_opts.showSuccessWithoutError === false) {
            m_opts['successMessage'] = null;
          }
          if (type === 'error') {
            if ((_ref4 = msg.errorCount) == null) {
              msg.errorCount = 0;
            }
            msg.errorCount += 1;
          }
          msgText = _this._getMessage(r = old.apply(null, resp), m_opts[type + 'Message']);
          if (type === 'error' && ((xhr != null ? xhr.status : void 0) === 0 || reason === 'abort')) {
            msg.hide();
            return;
          }
          if (msgText) {
            msgOpts = $.extend({}, m_opts, {
              message: msgText,
              type: type,
              events: (_ref5 = events[type]) != null ? _ref5 : {},
              hideOnNavigate: type === 'success'
            });
            if (type === 'error' && (xhr != null ? xhr.status : void 0) >= 500) {
              if ((_ref6 = msgOpts.retry) != null ? _ref6.allow : void 0) {
                if (msgOpts.hideAfter) {
                  msgOpts.hideAfter += (_ref7 = msgOpts.retry.delay) != null ? _ref7 : 10;
                }
                msgOpts._retryActions = true;
                msgOpts.actions = {
                  retry: {
                    label: 'retry now',
                    phrase: 'Retrying TIME',
                    auto: msgOpts.retry.auto,
                    delay: (_ref8 = msgOpts.retry.delay) != null ? _ref8 : 10,
                    action: function() {
                      var _ref9;
                      msgOpts.messageInstance = msg;
                      msgOpts.retry.delay = ((_ref9 = msgOpts.retry.delay) != null ? _ref9 : 10) * 2;
                      return _this["do"].apply(_this, [msgOpts, opts].concat(__slice.call(args)));
                    }
                  },
                  cancel: {
                    action: function() {
                      return msg.cancel();
                    }
                  }
                };
              }
            } else if (msgOpts._retryActions) {
              delete m_opts.actions.retry;
              delete m_opts.actions.cancel;
              delete m_opts._retryActions;
            }
            $.globalMessenger();
            msg.update(msgOpts);
            return msg.show();
          } else {
            return msg.hide();
          }
        };
      });
      msg._actionInstance = m_opts.action.apply(m_opts, [opts].concat(__slice.call(args)));
      return msg;
    };

    return ActionMessenger;

  })(Messenger);

  $.fn.messenger = function() {
    var $el, args, func, _ref;
    func = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    $el = this;
    if (!(func != null)) {
      if (!($el.data('messenger') != null)) {
        $el.data('messenger', new ActionMessenger({
          el: $el
        }));
        $._messengerInstance = $el.data('messenger');
      }
      return $el.data('messenger');
    } else {
      return (_ref = $el.data('messenger'))[func].apply(_ref, args);
    }
  };

  $.globalMessenger = function(opts) {
    var $el, $parent, choosen_loc, chosen_loc, defaultOpts, inst, loc, locations, _i, _len;
    inst = $._messengerInstance;
    defaultOpts = {
      extraClasses: 'fixed-messenger on-bottom on-right',
      parentLocations: ['body']
    };
    opts = $.extend(defaultOpts, opts);
    locations = opts.parentLocations;
    $parent = null;
    choosen_loc = null;
    for (_i = 0, _len = locations.length; _i < _len; _i++) {
      loc = locations[_i];
      $parent = $(loc);
      if ($parent.length) {
        chosen_loc = loc;
        break;
      }
    }
    if (!inst) {
      $el = $('<ul>');
      $parent.prepend($el);
      inst = $el.messenger();
      inst._location = chosen_loc;
    } else if ($(inst._location) !== $(chosen_loc)) {
      inst.$el.detach();
      $parent.prepend(inst.$el);
    }
    inst.$el.attr('class', "messenger " + opts.extraClasses);
    return inst;
  };

}).call(this);
