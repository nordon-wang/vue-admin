<template>
  <div class="login-container">
    <el-form
      ref="loginForm"
      :model="loginForm"
      :rules="loginRules"
      class="login-form"
      autocomplete="on"
      label-position="left"
    >
      <div class="title-container">
        <h3 class="title">善诊</h3>
      </div>

      <el-form-item prop="username">
        <span class="svg-container">
          <!-- <svg-icon icon-class="user" /> -->
        </span>
        <el-input
          ref="username"
          v-model="loginForm.username"
          placeholder="Username"
          name="username"
          type="text"
          tabindex="1"
          autocomplete="on"
        />
      </el-form-item>

      <el-tooltip v-model="capsTooltip" content="Caps lock is On" placement="right" manual>
        <el-form-item prop="password">
          <span class="svg-container">
            <!-- <svg-icon icon-class="password" /> -->
          </span>
          <el-input
            :key="passwordType"
            ref="password"
            v-model="loginForm.password"
            :type="passwordType"
            placeholder="Password"
            name="password"
            tabindex="2"
            autocomplete="on"
            @keyup.native="checkCapslock"
            @blur="capsTooltip = false"
            @keyup.enter.native="handleLogin"
          />
          <span class="show-pwd" @click="showPwd">
            <!-- <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" /> -->
          </span>
        </el-form-item>
      </el-tooltip>

      <el-button
        :loading="loading"
        type="primary"
        style="width:100%;margin-bottom:30px;"
        @click.native.prevent="handleLogin"
      >Login</el-button>

      <!-- <div style="position:relative">
        <div class="tips">
          <span>Username : admin</span>
          <span>Password : any</span>
        </div>
        <div class="tips">
          <span style="margin-right:18px;">Username : editor</span>
          <span>Password : any</span>
        </div>
      </div>-->
    </el-form>
    <canvas id="c" />
  </div>
</template>

<script>
export default {
  name: 'Login',
  components: {},
  data() {
    // 校验用户名
    const validateUsername = (rule, value, callback) => {
      callback()
    }

    // 校验秘密
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('The password can not be less than 6 digits'))
      } else {
        callback()
      }
    }

    return {
      loginForm: {
        username: '', // admin
        password: '' // 111111
      },
      loginRules: {
        username: [
          { required: true, trigger: 'blur', validator: validateUsername }
        ],
        password: [
          { required: true, trigger: 'blur', validator: validatePassword }
        ]
      },
      passwordType: 'password',
      capsTooltip: false,
      loading: false,
      showDialog: false,
      redirect: undefined,
      otherQuery: {}
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  created() {
    // window.addEventListener('storage', this.afterQRScan)
  },
  mounted() {
    if (this.loginForm.username === '') {
      this.$refs.username.focus()
    } else if (this.loginForm.password === '') {
      this.$refs.password.focus()
    }
    this.drawCanvas()
  },
  destroyed() {
    // window.removeEventListener('storage', this.afterQRScan)
  },
  methods: {
    drawCanvas() {
      const c = document.getElementById('c')
      var gl = c.getContext('webgl', { preserveDrawingBuffer: true })
      var w = (c.width = window.innerWidth)
      var h = (c.height = window.innerHeight)

      var webgl = {}
      var opts = {
        projectileAlpha: 0.8,
        projectileLineWidth: 1.3,
        fireworkAngleSpan: 0.5,
        baseFireworkVel: 3,
        addedFireworkVel: 3,
        gravity: 0.03,
        lowVelBoundary: -0.2,
        xFriction: 0.995,
        baseShardVel: 1,
        addedShardVel: 0.2,
        fireworks: 1000,
        baseShardsParFirework: 10,
        addedShardsParFirework: 10,
        shardFireworkVelMultiplier: 0.3,
        initHueMultiplier: 1 / 360,
        runHueAdder: 0.1 / 360
      }

      webgl.vertexShaderSource = `
uniform int u_mode;
uniform vec2 u_res;
attribute vec4 a_data;
varying vec4 v_color;

vec3 h2rgb( float h ){
	return clamp( abs( mod( h * 6. + vec3( 0, 4, 2 ), 6. ) - 3. ) -1., 0., 1. );
}
void clear(){
	gl_Position = vec4( a_data.xy, 0, 1 );
	v_color = vec4( 0, 0, 0, a_data.w );
}
void draw(){
	gl_Position = vec4( vec2( 1, -1 ) * ( ( a_data.xy / u_res ) * 2. - 1. ), 0, 1 );
	v_color = vec4( h2rgb( a_data.z ), a_data.w );
}
void main(){
	if( u_mode == 0 )
		draw();
	else
		clear();
}
`
      webgl.fragmentShaderSource = `
precision mediump float;
varying vec4 v_color;

void main(){
	gl_FragColor = v_color;
}
`

      webgl.vertexShader = gl.createShader(gl.VERTEX_SHADER)
      gl.shaderSource(webgl.vertexShader, webgl.vertexShaderSource)
      gl.compileShader(webgl.vertexShader)

      webgl.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
      gl.shaderSource(webgl.fragmentShader, webgl.fragmentShaderSource)
      gl.compileShader(webgl.fragmentShader)

      webgl.shaderProgram = gl.createProgram()
      gl.attachShader(webgl.shaderProgram, webgl.vertexShader)
      gl.attachShader(webgl.shaderProgram, webgl.fragmentShader)

      gl.linkProgram(webgl.shaderProgram)
      gl.useProgram(webgl.shaderProgram)

      webgl.dataAttribLoc = gl.getAttribLocation(webgl.shaderProgram, 'a_data')
      webgl.dataBuffer = gl.createBuffer()

      gl.enableVertexAttribArray(webgl.dataAttribLoc)
      gl.bindBuffer(gl.ARRAY_BUFFER, webgl.dataBuffer)
      gl.vertexAttribPointer(webgl.dataAttribLoc, 4, gl.FLOAT, false, 0, 0)

      webgl.resUniformLoc = gl.getUniformLocation(webgl.shaderProgram, 'u_res')
      webgl.modeUniformLoc = gl.getUniformLocation(
        webgl.shaderProgram,
        'u_mode'
      )

      gl.viewport(0, 0, w, h)
      gl.uniform2f(webgl.resUniformLoc, w, h)

      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
      gl.enable(gl.BLEND)

      gl.lineWidth(opts.projectileLineWidth)

      webgl.data = []

      webgl.clear = function() {
        gl.uniform1i(webgl.modeUniformLoc, 1)
        var a = 0.1
        webgl.data = [
          -1,
          -1,
          0,
          a,
          1,
          -1,
          0,
          a,
          -1,
          1,
          0,
          a,
          -1,
          1,
          0,
          a,
          1,
          -1,
          0,
          a,
          1,
          1,
          0,
          a
        ]
        webgl.draw(gl.TRIANGLES)
        gl.uniform1i(webgl.modeUniformLoc, 0)
        webgl.data.length = 0
      }
      webgl.draw = function(glType) {
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array(webgl.data),
          gl.STATIC_DRAW
        )
        gl.drawArrays(glType, 0, webgl.data.length / 4)
      }

      var fireworks = []
      var tick = 0
      var sins = []
      var coss = []
      var maxShardsParFirework =
        opts.baseShardsParFirework + opts.addedShardsParFirework
      var tau = 6.283185307179586476925286766559

      for (var i = 0; i < maxShardsParFirework; ++i) {
        sins[i] = Math.sin((tau * i) / maxShardsParFirework)
        coss[i] = Math.cos((tau * i) / maxShardsParFirework)
      }

      function Firework() {
        this.reset()
        this.shards = []
        for (var i = 0; i < maxShardsParFirework; ++i) {
          this.shards.push(new Shard(this))
        }
      }
      Firework.prototype.reset = function() {
        var angle =
          -Math.PI / 2 + (Math.random() - 0.5) * opts.fireworkAngleSpan
        var vel = opts.baseFireworkVel + opts.addedFireworkVel * Math.random()

        this.mode = 0
        this.vx = vel * Math.cos(angle)
        this.vy = vel * Math.sin(angle)

        this.x = Math.random() * w
        this.y = h

        this.hue = tick * opts.initHueMultiplier
      }
      Firework.prototype.step = function() {
        if (this.mode === 0) {
          var ph = this.hue
          var px = this.x
          var py = this.y

          this.hue += opts.runHueAdder

          this.x += this.vx *= opts.xFriction
          this.y += this.vy += opts.gravity

          webgl.data.push(
            px,
            py,
            ph,
            opts.projectileAlpha * 0.2,
            this.x,
            this.y,
            this.hue,
            opts.projectileAlpha * 0.2
          )

          if (this.vy >= opts.lowVelBoundary) {
            this.mode = 1

            this.shardAmount =
              (opts.baseShardsParFirework +
                opts.addedShardsParFirework * Math.random()) |
              0

            var baseAngle = Math.random() * tau
            var x = Math.cos(baseAngle)
            var y = Math.sin(baseAngle)
            var sin = sins[this.shardAmount]
            var cos = coss[this.shardAmount]

            for (var i = 0; i < this.shardAmount; ++i) {
              var vel = opts.baseShardVel + opts.addedShardVel * Math.random()
              this.shards[i].reset(x * vel, y * vel)
              var X = x
              x = x * cos - y * sin
              y = y * cos + X * sin
            }
          }
        } else if (this.mode === 1) {
          this.ph = this.hue
          this.hue += opts.runHueAdder

          var allDead = true
          for (let i = 0; i < this.shardAmount; ++i) {
            var shard = this.shards[i]
            if (!shard.dead) {
              shard.step()
              allDead = false
            }
          }

          if (allDead) {
            this.reset()
          }
        }
      }
      function Shard(parent) {
        this.parent = parent
      }
      Shard.prototype.reset = function(vx, vy) {
        this.x = this.parent.x
        this.y = this.parent.y
        this.vx = this.parent.vx * opts.shardFireworkVelMultiplier + vx
        this.vy = this.parent.vy * opts.shardFireworkVelMultiplier + vy
        this.starty = this.y
        this.dead = false
        this.tick = 1
      }
      Shard.prototype.step = function() {
        this.tick += 0.05

        var px = this.x
        var py = this.y

        this.x += this.vx *= opts.xFriction
        this.y += this.vy += opts.gravity

        // var proportion = 1 - (this.y - this.starty) / (h - this.starty)

        webgl.data.push(
          px,
          py,
          this.parent.ph,
          opts.projectileAlpha / this.tick,
          this.x,
          this.y,
          this.parent.hue,
          opts.projectileAlpha / this.tick
        )

        if (this.y > h) {
          this.dead = true
        }
      }

      function anim() {
        window.requestAnimationFrame(anim)

        webgl.clear()

        ++tick

        if (fireworks.length < opts.fireworks) {
          fireworks.push(new Firework())
        }

        fireworks.map(function(firework) {
          firework.step()
        })

        webgl.draw(gl.LINES)
      }
      anim()

      window.addEventListener('resize', function() {
        w = c.width = window.innerWidth
        h = c.height = window.innerHeight

        gl.viewport(0, 0, w, h)
        gl.uniform2f(webgl.resUniformLoc, w, h)
      })
      window.addEventListener('click', function(e) {
        var firework = new Firework()
        firework.x = e.clientX
        firework.y = e.clientY
        firework.vx = 0
        firework.vy = 0
        fireworks.push(firework)
      })
    },
    checkCapslock(e) {
      const { key } = e
      this.capsTooltip = key && key.length === 1 && key >= 'A' && key <= 'Z'
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store
            .dispatch('user/login', this.loginForm)
            .then(() => {
              this.$router.push({
                path: this.redirect || '/',
                query: this.otherQuery
              })
              this.loading = false
            })
            .catch(() => {
              this.loading = false
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }
  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

#c {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: 1;
  background-color: #111;
}

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    z-index: 9;
    width: 520px;
    max-width: 100%;
    padding: 160px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: 6px;
  }

  @media only screen and (max-width: 470px) {
    .thirdparty-button {
      display: none;
    }
  }
}
</style>
