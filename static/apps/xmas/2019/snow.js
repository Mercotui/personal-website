function jsParticle(origin, velocity, size, amplitude)
{
	this.origin = origin;
	this.position = new Vector2(origin.x, origin.y);
	this.velocity = velocity || new Vector2(0, 0);
	this.size = size;
	this.amplitude = amplitude;

	// randomize start values a bit
	this.dx = Math.random() * 100;

	this.update = function(delta_time)
	{
		this.position.y += this.velocity.y * delta_time;

		// oscilate the x value between -amplitude and +amplitude
		this.dx += this.velocity.x*delta_time;
		this.position.x = this.origin.x + (this.amplitude * Math.sin(this.dx));
	};
}

var jsCanvasSnow =
{
	canvas : null,
	ctx : null,
	particles : [],
	running : false,
  snowing : false,

	start_time : 0,
	frame_time : 0,

	init : function( )
	{
		// use the container width and height
		this.canvas = document.getElementById('snow_canvas');
		this.ctx = this.canvas.getContext('2d');

		// change these values
    // the 2 element arrays represent min and max values
		this.pAmount = 1000;         // amount of particles
		this.pSize = [0.5 , 2.0];    // min and max size
		this.pSwing = [0.1, 1];      // min and max oscilation speed for x movement
		this.pSpeed = [10, 50],     // min and max y speed
		this.pAmplitude = [25, 50];  // min and max distance for x movement
	},

	start : function()
	{
    this._init_particles();
		this.running = true;
		this.start_time = this.frame_time = microtime();
		this._loop();
	},

	stop : function()
	{
		this.running = false;
	},

  startsnow : function (){
    this._restart_fallen_particles();
    this.snowing = true;
  },

  stopsnow : function (){
    this.snowing = false;
    this._fast_clear_falling_particles();
  },

  resize : function(w, h)
  {
    this.canvas.width = w;
    this.canvas.height = h;

    this.ctx.beginPath();
    this.ctx.arc(w/2, h/2, Math.min(h/2, w/2), 0, Math.PI * 2);
    this.ctx.clip();
  },

	_loop : function()
	{
		if ( jsCanvasSnow.running )
		{
			jsCanvasSnow._clear();
			jsCanvasSnow._update();
			jsCanvasSnow._draw();
			jsCanvasSnow._queue();
		}
	},

  _restart_fallen_particles : function()
	{
    // reinit any fallen particle
    for ( var i = 0 ; i < this.particles.length ; i++)
		{
			var particle = this.particles[i];
      if (particle.position.y > this.canvas.height){
				// reset the particle to a random height
				particle.position.y = frand(-this.canvas.height, 0);
      }
    }
  },

  _fast_clear_falling_particles : function()
  {
    // stop any falling particles from entering the view
    for ( var i = 0 ; i < this.particles.length ; i++)
    {
      var particle = this.particles[i];
      if (particle.position.y < 0){
        // reset the particle to a random height
        particle.position.y = this.canvas.height+ this.pSize[1];
      }
    }
  },


	_init_particles : function()
	{
		// clear the particles array
		this.particles.length = 0;

		for ( var i = 0 ; i < this.pAmount ; i++)
		{
			var origin = new Vector2(frand(0, this.canvas.width), this.canvas.height+this.pSize[1]);
			var velocity = new Vector2(frand(this.pSwing[0],this.pSwing[1]), frand(this.pSpeed[0],this.pSpeed[1]));
			var size = frand(this.pSize[0], this.pSize[1]);
			var amplitude = frand(this.pAmplitude[0], this.pAmplitude[1]);

			this.particles.push(new jsParticle(origin, velocity, size, amplitude));
		}
	},

	_update : function()
	{
		// calculate the time since the last frame
		var now_time = microtime();
		var delta_time = now_time - this.frame_time;

		for ( var i = 0 ; i < this.particles.length ; i++)
		{
			var particle = this.particles[i];

      if ((particle.position.y - particle.size) < this.canvas.height){
        particle.update(delta_time);
      } else if (this.snowing) {
				// reset the particle to the top and a random x position
				particle.position.y = -particle.size;
				particle.position.x = particle.origin.x = Math.random() * this.canvas.width;
				particle.dx = Math.random() * 100;
			}
		}

		// save this time for the next frame
		this.frame_time = now_time;
	},

	_draw : function()
	{
		this.ctx.fillStyle = 'rgb(255,255,255)';

		for ( var i = 0 ; i < this.particles.length ; i++)
		{
			var particle = this.particles[i];
      this.ctx.fillRect(particle.position.x, particle.position.y, particle.size, particle.size);
		}
	},

	_clear : function()
	{
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},

	_queue : function()
	{
		window.requestAnimationFrame( jsCanvasSnow._loop );
	}
};

function microtime()
{
	return new Date().getTime()*0.001;
}

// returns a random integer from min to max
function irand(min, max)
{
	return Math.floor((min||0) + Math.random() * ((max+1||100) - (min||0)));
}

// returns a random float from min to max
function frand(min, max)
{
	return (min||0) + Math.random() * ((max||1) - (min||0));
}

function clamp(value, min, max)
{
	return Math.min(Math.max(value, min), max);
}

// Two component vector class
function Vector2(x, y)
{
	this.x = x || 0;
	this.y = y || 0;

	this.add = function(other)
	{
		this.x += other.x;
		this.y += other.y;
	}

	this.magnitude = function()
	{
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
}

function Color(r, g, b)
{
	this.r = r || 0;
	this.g = g || 0;
	this.b = b || 0;
}
