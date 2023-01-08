# gas-deno-template

Writing Google Apps Script in deno.

## Getting Started

### Login

```bash
deno task clasp login
```

Then enable the Google Apps Script API:
<https://script.google.com/home/usersettings>

### Create new project

```bash
deno task create --title "My Script"
```

### Clone exists project

```bash
deno task clone --id <Project ID>
```

### Deploy

```bash
deno task deploy
```
