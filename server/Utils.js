const Vector2D = function () {

    let basicVector = {
        x: 0,
        y: 0,

        add(otherVec) {
            this.x = otherVec.x;
            this.y = otherVec.y;
        },
        addAtAngle(value, angle) {
            this.x += value * Math.cos(angle);
            this.y += value * Math.sin(angle);
        },
        constMult(factor) {
            var scaleVec = new Vector2D(this.x * factor, this.y * factor);
            if (Math.abs(scaleVec.x) < .001) {
                scaleVec.x = 0;
            }
            if (Math.abs(scaleVec.y) < .001) {
                scaleVec.y = 0;
            }
            return scaleVec;
        },
        angleTo(otherPoint) {
            return Math.PI + Math.atan2(this.y - otherPoint.y, this.x - otherPoint.x);
        },
        rotateOnOrigin(angleDelta) {
            const magnitude = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
            var myAngle = Math.atan2(this.y, this.x);

            myAngle += angleDelta;

            this.x = magnitude * Math.cos(myAngle);
            this.y = magnitude * Math.sin(myAngle);
        },
        wrap(minX, maxX, minY, maxY) {
            const wrappedVec = new Vector2D(this.x, this.y);
            if (this.x < minX) {
                wrappedVec.x = maxX - (minX - this.x);
            } else if (this.x > maxX) {
                wrappedVec.x = minX + (this.x - maxX);
            }

            if (this.y < minY) {
                wrappedVec.y = maxY - (minY - this.y);
            } else if (this.y > maxY) {
                wrappedVec.y = minY + (this.y - maxY);
            }
            return wrappedVec;
        }
    }

    const createVectorAtAngle = function (x, y, angle) {
        return this.create(x * Math.cos(angle), y * Math.sin(angle));
    }

    const createRandom = function (minX, maxX, minY, maxY) {
        return this.create(Math.random() * (maxX - minX) + minX, Math.random() * (maxY - minY) + minY);
    }

    const create = function (x, y) {
        const obj = Object.create(this.basicVector);
        obj.x = x;
        obj.y = y;
        return obj;
    };

    return { create, createRandom, createVectorAtAngle };
}

const Line = function () {

    this.basicLine = {
        p1: null,
        p2: null,

        getShiftedLine(amount) {
            const shifted = Line.create(Vector2D.create(this.p1.x, this.p1.y), Vector2D.create(this.p2.x, this.p2.y));
            shifted.p1.add(amount);
            shifted.p2.add(amount);
            return shifted;
        },

        getRotatedLine(angle) {
            const rotated = Line.create(Vector2D.create(this.p1.x, this.p1.y), Vector2D.create(this.p2.x, this.p2.y));
            if (!angle) return rotated;
            rotated.p1.rotateOnOrigin(angle);
            rotated.p2.rotateOnOrigin(angle);
            return rotated;
        },

        overlaps(otherLine) {
            //Code adopted from GeeksForGeeks
            const o1 = this.orientation(this.p1, this.p2, otherLine.p1);
            const o2 = this.orientation(this.p1, this.p2, otherLine.p2);
            const o3 = this.orientation(otherLine.p1, otherLine.p2, this.p1);
            const o4 = this.orientation(otherLine.p1, otherLine.p2, this.p2);

            // General case
            if (o1 != o2 && o3 != o4)
                return true;

            // Special Cases 
            // p1, q1 and p2 are colinear and p2 lies on segment p1q1 
            if (o1 == 0 && this.onSegment(this.p1, otherLine.p1, this.p2)) return true;

            // p1, q1 and q2 are colinear and q2 lies on segment p1q1 
            if (o2 == 0 && this.onSegment(this.p1, otherLine.p2, this.p2)) return true;

            // p2, q2 and p1 are colinear and p1 lies on segment p2q2 
            if (o3 == 0 && this.onSegment(otherLine.p1, this.p1, otherLine.p2)) return true;

            // p2, q2 and q1 are colinear and q1 lies on segment p2q2 
            if (o4 == 0 && this.onSegment(otherLine.p1, this.p2, otherLine.p2)) return true;

            return false; // Doesn't fall in any of the above cases 
        }
    }

    this.create = function (startPoint, endPoint) {
        const obj = Object.create(this.basicLine);
        obj.p1 = startPoint;
        obj.p2 = endPoint;
        return obj;
    };

    return { create };
}

function onSegment(start, q, end) {
    return (q.x <= Math.max(start.x, end.x) && q.x >= Math.min(start.x, end.x) &&
        q.y <= Math.max(start.y, end.y) && q.y >= Math.min(start.y, end.y));
}

function orientation(p, q, r) {
    const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (val == 0) return 0; // colinear 

    return (val > 0) ? 1 : 2; // clock or counterclock wise  
}

function overlap(firstShape, otherShape) {
    //Quickly check by radius
    if (Math.abs(firstShape.pos.x - otherShape.pos.x) < otherShape.width / 2 + firstShape.width / 2
        && Math.abs(firstShape.pos.y - otherShape.pos.y) < otherShape.height / 2 + firstShape.height / 2) {
        //Check specific patterning
        const shiftAmount = new Vector2D(firstShape.pos.x - otherShape.pos.x, firstShape.pos.y - otherShape.pos.y);
        var myShiftedLine;
        var otherShiftedLine;
        for (var i = firstShape.lines.length - 1; i > -1; i--) {
            myShiftedLine = firstShape.lines[i].getRotatedLine(firstShape.angle);
            myShiftedLine = myShiftedLine.getShiftedLine(shiftAmount);

            for (var j = otherShape.lines.length - 1; j > -1; j--) {
                otherShiftedLine = otherShape.lines[j].getRotatedLine(otherShape.angle);
                if (myShiftedLine.overlaps(otherShiftedLine)) {
                    return true;
                }
            }
        }
    }
    return false;
}