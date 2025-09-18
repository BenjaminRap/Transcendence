precision mediump float;

attribute vec3 position;

uniform mat4 worldViewProjection;
varying vec3 vPosition;

void main()
{
    gl_Position = worldViewProjection * vec4(position, 1.0);
	vPosition = position;
}
