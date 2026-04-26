export async function updateEnvFile(
  path: string,
  updates: Record<string, string>
) {
  let content = ""
  try {
    content = await Bun.file(path).text()
  } catch {
    content = ""
  }

  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, "m")
    const line = `${key}=${value}`
    if (regex.test(content)) {
      content = content.replace(regex, line)
    } else {
      content += `\n${line}`
    }
  }

  await Bun.write(path, content)
}
