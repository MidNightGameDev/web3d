
async function testFlow() {
    const baseUrl = 'http://localhost:5000/api';
    console.log('--- Starting Test Flow ---');

    // 1. Register User
    let email = `testuser_${Date.now()}@example.com`;
    let username = `TestUser_${Date.now()}`;
    let password = 'password123';

    console.log(`\n[1] Registering user: ${email}`);
    let res = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password })
    });
    let data = await res.json();
    console.log('Register Response:', data);
    if (!res.ok) throw new Error('Registration failed');

    // 2. Login User
    console.log(`\n[2] Logging in user: ${email}`);
    res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    let loginData = await res.json();
    console.log('Login Response:', loginData);
    if (!res.ok) throw new Error('Login failed');

    // 3. Create Project
    console.log(`\n[3] Creating new project`);
    res = await fetch(`${baseUrl}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'My Async Project',
            ownerId: loginData.user.id,
            ownerName: loginData.user.username
        })
    });
    let projectData = await res.json();
    console.log('Create Project Response:', projectData);
    if (!res.ok) throw new Error('Project creation failed');

    const projectId = projectData._id || projectData.id;

    // 4. Update Scene Objects
    console.log(`\n[4] Updating scene with objects (mimicking save in editor)`);
    const sceneId = projectData.scenes[0].id;
    res = await fetch(`${baseUrl}/projects/${projectId}/scenes/${sceneId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            objectCount: 2,
            data: { objects: [{ type: 'cube', id: 'obj1' }, { type: 'sphere', id: 'obj2' }] }
        })
    });
    let updateData = await res.json();
    console.log('Update Scene Response (Keys):', Object.keys(updateData));
    if (!res.ok) throw new Error('Scene update failed');

    // 5. Publish Project
    console.log(`\n[5] Publishing project to market`);
    res = await fetch(`${baseUrl}/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            status: 'published',
            price: 25,
            forSale: true
        })
    });
    let publishData = await res.json();
    console.log('Publish Project Response:', publishData.status, publishData.price, publishData.forSale);
    if (!res.ok) throw new Error('Publishing failed');

    // 6. Fetch Projects (Market view)
    console.log(`\n[6] Fetching all projects`);
    res = await fetch(`${baseUrl}/projects`);
    let allProjects = await res.json();
    const found = allProjects.find(p => p.id === projectId);
    console.log(`Found published project in list? ${!!found}. Status: ${found?.status}`);

    console.log('\n--- Test Flow Completed Successfully ---');
}

testFlow().catch(console.error);
