precision mediump float;

varying vec3 vPosition;

const	vec4 blue = vec4(0.0f, 0.0f, 1.0f, 1.0f);
const	vec4 red = vec4(1.0f, 0.0f, 0.0f, 1.0f);

void main()
{
	gl_FragColor = mix(blue, red, (vPosition.y + 100.0f) / 250.0f);
}
