## How To Run

1. Compile Backend

```
cd backend
npm i
npm install -g typescript
tsc
```

2. Compile Frontend

```
cd frontend
npm i
npm run build
```

3. Make Config Files

```
touch .env.local
cd backend
touch .env
```

.env can have PORT=
.env.local MUST have VITE_OP_API=

4. Run Backend & Frontend

```
cd backend
node .
```

```
cd frontend
.... // host the files, I recommend caddy!
```