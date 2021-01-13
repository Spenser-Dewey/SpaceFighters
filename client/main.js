// const Http = new XMLHttpRequest();
// const url = "http://localhost"
// EXPANSION IDEAS:
//  fix stars: J
//  mini map: J
//  powerups: S
//  powerup notification: S
//  scoring: S
//  leaderboard: S
//  kill notification: J
function map(x, in_min, in_max, out_min, out_max) {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
var ws = new WebSocket("ws://192.168.1.128");
var keys_down = new Set();
// Benedict Cumberbatch's real name is Bucket Crunderdunder
ws.onmessage = function (message) {
    if (window.asteroidsGame) {
        var msg = JSON.parse(message.data);
        var numNew = msg.frameTimer - asteroidsGame.lastFrame;
        asteroidsGame.lastFrame = msg.frameTimer;
        for (var i = 0; i < msg.asteroids.length; i++) {
            var asteroid = msg.asteroids[i];
            asteroidsGame.gameElements.push(new Asteroid(asteroid.id, new Vector2D(asteroid.pos.x, asteroid.pos.y), new Vector2D(asteroid.velocity.x, asteroid.velocity.y), asteroid.lines, asteroid.angle, asteroid.rotationalVelocity));
        }
        // msg.asteroids.list.forEach(asteroid => {
        //     asteroidsGame.gameElements.push(new Asteroid(asteroid.id, asteroid.pos, asteroid.velocity, asteroid.lines, asteroid.angle, asteroid.rotationalVelocity));
        // });
        msg.bullets.forEach(function (bullet) {
            asteroidsGame.gameElements.push(new Bullet(bullet.id, new Vector2D(bullet.pos.x, bullet.pos.y), bullet.velocity, bullet.angle, bullet.width, bullet.height, bullet.color));
        });
        msg.ships.forEach(function (ship) {
            asteroidsGame.gameElements.push(new Trail(new Vector2D(ship.pos.x, ship.pos.y).add(Vector2D.fromAngle(ship.angle).mult(-ship.height / 2))));
        });
        switch (msg.type) {
            case "join":
                console.log(msg);
                asteroidsGame.playerShipID = msg.id;
                asteroidsGame.canvas.width = msg.clientWidth;
                asteroidsGame.canvas.height = msg.clientHeight;
                asteroidsGame.clientWidth = msg.clientWidth;
                asteroidsGame.clientHeight = msg.clientHeight;
                asteroidsGame.width = msg.width;
                asteroidsGame.height = msg.height;
                asteroidsGame.ctx = asteroidsGame.canvas.getContext("2d");
                asteroidsGame.ctx.fillStyle = "rgb(0, 0, 0)";
                asteroidsGame.ctx.fillRect(0, 0, asteroidsGame.canvas.width, asteroidsGame.canvas.height);
                // msg.ships.forEach(ship => {
                //     if (ship.id === asteroidsGame.playerShipID) {
                //         asteroidsGame.gameElements.forEach(element => {
                //             element.move(new Vector2D(ship.pos.x, ship.pos.y).mult(-1));
                //         });
                //     }
                // });
                for (var i = 0; i < (asteroidsGame.width * asteroidsGame.height) / 10000; i++) {
                    asteroidsGame.stars.push(new Star(new Vector2D(Math.random() * asteroidsGame.width, Math.random() * asteroidsGame.height), Math.random() * 5 + 1));
                }
                setInterval(function () {
                    asteroidsGame.sendData(JSON.stringify({
                        type: "update",
                        id: asteroidsGame.playerShipID,
                        lastFrame: asteroidsGame.lastFrame,
                        keys: Array.from(keys_down)
                    }));
                }, 33);
                break;
            case "update":
                msg.deaths.forEach(function (death) {
                    asteroidsGame.gameElements = asteroidsGame.gameElements.filter(function (e) {
                        return !e.id || death !== e.id;
                    });
                });
                for (var i = 0; i < numNew; i++) {
                    asteroidsGame.update();
                }
                msg.collisions.forEach(function (collision) {
                    if (!collision.bullet) {
                        // let asteroid:Asteroid = asteroidsGame.gameElements.find(e => e.id === collision.asteroid);
                        // let ship = msg.ships.find(e => e.id === collision.ship);
                        asteroidsGame.gameElements.push(new Debris(new Vector2D(collision.ship.pos.x, collision.ship.pos.y), collision.ship.angle, 30, "#b06000"));
                        asteroidsGame.gameElements.push(new Debris(new Vector2D(collision.asteroid.pos.x, collision.asteroid.pos.y), collision.ship.angle, 30, "#334243"));
                    }
                    else if (!collision.asteroid) {
                        asteroidsGame.gameElements.push(new Debris(new Vector2D(collision.ship.pos.x, collision.ship.pos.y), collision.ship.angle, 30, "#b06000"));
                    }
                    else if (!collision.ship) {
                        asteroidsGame.gameElements.push(new Debris(new Vector2D(collision.bullet.pos.x, collision.bullet.pos.y), collision.bullet.angle, 30, "#334243"));
                    }
                    else {
                        console.log("COLLISION ERROR:\n" + collision);
                    }
                });
                var ship_1 = msg.ships.find(function (s) { return s.id === asteroidsGame.playerShipID; });
                if (ship_1) {
                    asteroidsGame.playerShipPos = new Vector2D(ship_1.pos.x, ship_1.pos.y);
                }
                // asteroidsGame.gameElements.forEach(element => {
                //     // element.move(new Vector2D(asteroidsGame.playerShipPos.x, asteroidsGame.playerShipPos.y).add(new Vector2D(ship.velocity.x, ship.velocity.y)).mult(-1));
                //     element.move(new Vector2D(asteroidsGame.playerShipPos.x, asteroidsGame.playerShipPos.y).mult(-1));
                //     element.move(new Vector2D(asteroidsGame.canvas.width / 2, asteroidsGame.canvas.height / 2));
                // });
                asteroidsGame.move(new Vector2D(asteroidsGame.playerShipPos.x, asteroidsGame.playerShipPos.y).mult(-1).add(new Vector2D(asteroidsGame.canvas.width / 2, asteroidsGame.canvas.height / 2)));
                if (ship_1 && ship_1.velocity) {
                    asteroidsGame.stars.forEach(function (e) { return e.move(new Vector2D(-ship_1.velocity.x, -ship_1.velocity.y)); });
                }
                asteroidsGame.gameElements.forEach(function (e) {
                    if (e.pos) {
                        e.pos.mod(asteroidsGame.width, asteroidsGame.height);
                    }
                    else {
                        e.modAll();
                    }
                });
                asteroidsGame.stars.forEach(function (e) {
                    e.pos.mod(asteroidsGame.width, asteroidsGame.height);
                });
                // console.log(asteroidsGame.stars[0].pos);
                asteroidsGame.draw();
                asteroidsGame.move(new Vector2D(asteroidsGame.playerShipPos.x, asteroidsGame.playerShipPos.y).add(new Vector2D(asteroidsGame.canvas.width / 2, asteroidsGame.canvas.height / 2).mult(-1)));
                msg.ships.forEach(function (ship) {
                    asteroidsGame.drawShip(ship);
                });
                asteroidsGame.ctx.fillStyle = "#222";
                asteroidsGame.ctx.fillRect(asteroidsGame.clientWidth - 200, 0, 200, 200);
                asteroidsGame.ctx.fillStyle = "#f00";
                msg.ships.forEach(function (ship) {
                    var xPos = map(ship.pos.x, 0, asteroidsGame.width, asteroidsGame.clientWidth - 200, asteroidsGame.clientWidth);
                    var yPos = map(ship.pos.y, 0, asteroidsGame.height, 0, 200);
                    if (ship.id === asteroidsGame.playerShipID) {
                        asteroidsGame.ctx.fillStyle = "#55f";
                        asteroidsGame.ctx.fillRect(xPos, yPos, 10, 10);
                        asteroidsGame.ctx.fillStyle = "#f00";
                    }
                    else {
                        asteroidsGame.ctx.fillRect(xPos, yPos, 10, 10);
                    }
                });
                break;
        }
    }
};
var AsteroidsGame = /** @class */ (function () {
    function AsteroidsGame() {
        var joinMsg = {
            type: "join",
            username: window.username,
            wingColor: window.wingColor,
            bodyColor: window.bodyColor,
            bulletColor: window.bulletColor
        };
        this.sendData(JSON.stringify(joinMsg));
        this.canvas = window.canvas;
        this.gameElements = [];
        this.stars = [];
        function logKeyData(e, isPressed) {
            if (isPressed)
                keys_down.add(e.key);
            else
                keys_down.delete(e.key);
        }
        window.addEventListener("keydown", function (e) {
            logKeyData(e, true);
        });
        window.addEventListener("keyup", function (e) {
            logKeyData(e, false);
        });
    }
    AsteroidsGame.prototype.sendData = function (data) {
        ws.send(data);
    };
    AsteroidsGame.prototype.move = function (d) {
        this.gameElements.forEach(function (e) { return e.move(d); });
    };
    AsteroidsGame.prototype.update = function () {
        this.gameElements.forEach(function (e) { return e.update(); });
    };
    AsteroidsGame.prototype.draw = function () {
        var _this = this;
        asteroidsGame.ctx.fillStyle = "#000";
        asteroidsGame.ctx.fillRect(0, 0, asteroidsGame.canvas.width, asteroidsGame.canvas.height);
        asteroidsGame.stars.forEach(function (star) { return star.draw(_this.ctx); });
        asteroidsGame.gameElements.filter(function (e) { return e instanceof Bullet; }).forEach(function (e) { return e.draw(_this.ctx); });
        asteroidsGame.gameElements.filter(function (e) { return e instanceof Asteroid; }).forEach(function (e) { return e.draw(_this.ctx); });
        asteroidsGame.gameElements.filter(function (e) { return e instanceof Debris; }).forEach(function (e) { return e.draw(_this.ctx); });
        asteroidsGame.gameElements.filter(function (e) { return e instanceof Trail; }).forEach(function (e) { return e.draw(_this.ctx); });
    };
    AsteroidsGame.prototype.drawShip = function (ship) {
        asteroidsGame.ctx.save();
        if (ship.id === asteroidsGame.playerShipID) {
            asteroidsGame.ctx.translate(asteroidsGame.canvas.width / 2, asteroidsGame.canvas.height / 2);
        }
        else {
            var p = new Vector2D(ship.pos.x, ship.pos.y).add(asteroidsGame.playerShipPos.mult(-1));
            p.add(new Vector2D(asteroidsGame.canvas.width / 2, asteroidsGame.canvas.height / 2));
            p.mod(asteroidsGame.width, asteroidsGame.height);
            asteroidsGame.ctx.translate(p.x, p.y);
        }
        asteroidsGame.ctx.fillStyle = "#FFF";
        asteroidsGame.ctx.textAlign = "center";
        asteroidsGame.ctx.font = "20px Arial";
        asteroidsGame.ctx.fillText(ship.username, 0, -45);
        asteroidsGame.ctx.rotate(ship.angle);
        asteroidsGame.ctx.fillStyle = ship.bodyColor;
        asteroidsGame.ctx.beginPath();
        asteroidsGame.ctx.moveTo(-ship.width / 2, 0);
        asteroidsGame.ctx.bezierCurveTo(0, ship.height, -ship.width / 4, ship.height / 8, ship.width / 2, 0);
        asteroidsGame.ctx.bezierCurveTo(-ship.width / 4, -ship.height / 8, 0, -ship.height, -ship.width / 2, 0);
        asteroidsGame.ctx.fill();
        asteroidsGame.ctx.lineWidth = 2.0;
        asteroidsGame.ctx.strokeStyle = "#2222aa88";
        asteroidsGame.ctx.beginPath();
        asteroidsGame.ctx.moveTo(-ship.width / 2, 0);
        asteroidsGame.ctx.lineTo(3 * ship.width / 8, 0);
        asteroidsGame.ctx.stroke();
        asteroidsGame.ctx.strokeStyle = ship.wingColor;
        asteroidsGame.ctx.beginPath();
        asteroidsGame.ctx.moveTo(-3 * ship.width / 16, 7 * ship.height / 16);
        asteroidsGame.ctx.quadraticCurveTo(0, 0, ship.width / 2, 0);
        asteroidsGame.ctx.quadraticCurveTo(0, 0, -3 * ship.width / 16, -7 * ship.height / 16);
        asteroidsGame.ctx.stroke();
        asteroidsGame.ctx.strokeStyle = "#99999988";
        asteroidsGame.ctx.beginPath();
        asteroidsGame.ctx.moveTo(-3 * ship.width / 16, -7 * ship.height / 16);
        asteroidsGame.ctx.lineTo(-ship.width / 3, -7 * ship.height / 16);
        asteroidsGame.ctx.moveTo(-ship.width / 8, -5 * ship.height / 16);
        asteroidsGame.ctx.lineTo(-7 * ship.width / 16, -5 * ship.height / 16);
        asteroidsGame.ctx.moveTo(-ship.width / 32, -3 * ship.height / 16);
        asteroidsGame.ctx.lineTo(-ship.width / 2, -3 * ship.height / 16);
        asteroidsGame.ctx.moveTo(5 * ship.width / 32, -ship.height / 16);
        asteroidsGame.ctx.lineTo(-ship.width / 2, -ship.height / 16);
        asteroidsGame.ctx.moveTo(-3 * ship.width / 16, 7 * ship.height / 16);
        asteroidsGame.ctx.lineTo(-ship.width / 3, 7 * ship.height / 16);
        asteroidsGame.ctx.moveTo(-ship.width / 8, 5 * ship.height / 16);
        asteroidsGame.ctx.lineTo(-7 * ship.width / 16, 5 * ship.height / 16);
        asteroidsGame.ctx.moveTo(-ship.width / 32, 3 * ship.height / 16);
        asteroidsGame.ctx.lineTo(-ship.width / 2, 3 * ship.height / 16);
        asteroidsGame.ctx.moveTo(5 * ship.width / 32, ship.height / 16);
        asteroidsGame.ctx.lineTo(-ship.width / 2, ship.height / 16);
        asteroidsGame.ctx.stroke();
        asteroidsGame.ctx.restore();
        // if (ship.id === asteroidsGame.playerShipID) {
        //     asteroidsGame.gameElements.forEach(element => {
        //         element.move(new Vector2D(ship.pos.x, ship.pos.y));
        //     });
        // }
    };
    return AsteroidsGame;
}());
var Bullet = /** @class */ (function () {
    function Bullet(id, pos, vel, angle, width, height, color) {
        this.id = id;
        this.pos = pos;
        this.vel = vel;
        this.angle = angle;
        this.width = width;
        this.height = height;
        this.color = color;
    }
    Bullet.prototype.move = function (d) {
        this.pos.add(d);
    };
    Bullet.prototype.update = function () {
        this.pos.add(this.vel);
    };
    Bullet.prototype.draw = function (ctx) {
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.color;
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.angle);
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    };
    return Bullet;
}());
var Debris = /** @class */ (function () {
    function Debris(pos, angle, count, color) {
        this.chunks = [];
        for (var i = 0; i < count; i++) {
            var randMag = Math.random() * 6 + 1;
            var randAngle = Math.random() * (3 * Math.PI / 2) - 3 * Math.PI / 4 + angle;
            this.chunks.push(new Debris.Debri(new Vector2D(pos.x, pos.y), Vector2D.fromAngle(randAngle).mult(randMag), Math.random() * 8, this));
        }
        this.color = color;
    }
    Debris.prototype.modAll = function () {
        this.chunks.forEach(function (chunk) { return chunk.pos.mod(asteroidsGame.width, asteroidsGame.height); });
    };
    Debris.prototype.move = function (d) {
        this.chunks.forEach(function (chunk) { return chunk.move(d); });
    };
    Debris.prototype.update = function () {
        this.chunks.forEach(function (chunk) { return chunk.update(); });
        this.chunks = this.chunks.filter(function (chunk) { return chunk.radius > 0; });
        if (!this.chunks.length) {
            asteroidsGame.gameElements.splice(asteroidsGame.gameElements.indexOf(this), 1);
        }
    };
    Debris.prototype.draw = function (ctx) {
        this.chunks.forEach(function (chunk) { return chunk.draw(ctx); });
    };
    Debris.FRICTION_CONSTANT = 0.95;
    Debris.DECAY_CONSTANT = 0.2;
    return Debris;
}());
(function (Debris) {
    var Debri = /** @class */ (function () {
        function Debri(pos, vel, radius, superThis) {
            this.pos = pos;
            this.vel = vel;
            this.radius = radius;
            this.superThis = superThis;
        }
        Debri.prototype.move = function (d) {
            this.pos.add(d);
        };
        Debri.prototype.update = function () {
            this.pos.add(this.vel);
            this.vel.mult(Debris.FRICTION_CONSTANT);
            this.radius -= Debris.DECAY_CONSTANT;
        };
        Debri.prototype.draw = function (ctx) {
            ctx.fillStyle = this.superThis.color;
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
            ctx.fill();
        };
        return Debri;
    }());
    Debris.Debri = Debri;
})(Debris || (Debris = {}));
var Star = /** @class */ (function () {
    function Star(pos, depth) {
        this.pos = pos;
        this.depth = depth;
    }
    Star.prototype.move = function (d) {
        this.pos.add(d.copy().mult(1 - (this.depth / 10)));
        // console.log(d);
        // this.pos.add(d);
    };
    Star.prototype.update = function () {
    };
    Star.prototype.draw = function (ctx) {
        ctx.strokeStyle = "#ffffff";
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(this.pos.x, this.pos.y, 2, 2);
    };
    return Star;
}());
var Trail = /** @class */ (function () {
    function Trail(pos) {
        this.pos = pos;
        this.radius = 9;
    }
    Trail.prototype.move = function (d) {
        this.pos.add(d);
    };
    Trail.prototype.update = function () {
        this.radius *= .85;
        if (this.radius < 0.01) {
            asteroidsGame.gameElements.splice(asteroidsGame.gameElements.indexOf(this), 1);
        }
    };
    Trail.prototype.draw = function (ctx) {
        ctx.fillStyle = "#5555ff77";
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
    };
    return Trail;
}());
var Asteroid = /** @class */ (function () {
    function Asteroid(id, pos, vel, lines, angle, angleVel) {
        this.id = id;
        this.pos = pos;
        this.vel = vel;
        this.lines = lines;
        this.angle = angle;
        this.angleVel = angleVel;
    }
    Asteroid.prototype.move = function (d) {
        this.pos.add(d);
    };
    Asteroid.prototype.update = function () {
        this.pos.add(this.vel);
        this.angle = (this.angleVel + this.angle) % (Math.PI * 2);
    };
    Asteroid.prototype.draw = function (ctx) {
        ctx.fillStyle = "#334243";
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.moveTo(this.lines[0].x, this.lines[0].y);
        for (var i = this.lines.length - 1; i > -1; i--) {
            ctx.lineTo(this.lines[i].x, this.lines[i].y);
        }
        ctx.fill();
        ctx.restore();
    };
    return Asteroid;
}());
var Vector2D = /** @class */ (function () {
    function Vector2D(x, y) {
        this.x = x;
        this.y = y;
    }
    Vector2D.prototype.add = function (other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    };
    Vector2D.prototype.mult = function (factor) {
        this.x *= factor;
        this.y *= factor;
        return this;
    };
    Vector2D.fromAngle = function (angle) {
        return new Vector2D(Math.cos(angle), Math.sin(angle));
    };
    Vector2D.prototype.mod = function (xMax, yMax) {
        this.x = ((this.x % xMax) + xMax) % xMax;
        this.y = ((this.y % yMax) + yMax) % yMax;
        // this.x %= xMax;
        // this.y %= yMax;
        return this;
    };
    Vector2D.prototype.copy = function () {
        return new Vector2D(this.x, this.y);
    };
    return Vector2D;
}());
//# sourceMappingURL=main.js.map