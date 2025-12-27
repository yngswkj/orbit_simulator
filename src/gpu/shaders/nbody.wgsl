struct Body {
    position : vec3<f32>,
    mass : f32,
    velocity : vec3<f32>,
    radius : f32,
}

struct Params {
    dt : f32,
    bodyCount : u32,
    G : f32,
    softening : f32,
}

@group(0) @binding(0) var<storage, read> bodiesIn : array<Body>;
@group(0) @binding(1) var<storage, read_write> bodiesOut : array<Body>;
@group(0) @binding(2) var<uniform> params : Params;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) GlobalInvocationID : vec3<u32>) {
    let index = GlobalInvocationID.x;
    if (index >= params.bodyCount) {
        return;
    }

    let myPos = bodiesIn[index].position;
    var acc = vec3<f32>(0.0, 0.0, 0.0);

    // O(N^2) Force Calculation
    // Loop through all bodies
    for (var i : u32 = 0u; i < params.bodyCount; i = i + 1u) {
        if (i == index) {
            continue;
        }

        let otherPos = bodiesIn[i].position;
        let otherMass = bodiesIn[i].mass;

        let diff = otherPos - myPos;
        let distSq = dot(diff, diff) + params.softening; // Including softening squared
        let invDist = inverseSqrt(distSq);
        let invDist3 = invDist * invDist * invDist;
        
        acc = acc + diff * (params.G * otherMass * invDist3);
    }

    // Integration (Velocity Verlet / Euler Semi-implicit)
    let oldVel = bodiesIn[index].velocity;
    let newVel = oldVel + acc * params.dt;
    let newPos = myPos + newVel * params.dt;

    // Write back
    bodiesOut[index].position = newPos;
    bodiesOut[index].velocity = newVel;
    bodiesOut[index].mass = bodiesIn[index].mass;
    bodiesOut[index].radius = bodiesIn[index].radius;
}
