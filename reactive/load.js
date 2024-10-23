async function loadRoleBasedFeatures(userData) {
  let roleModule

  switch (userData.role) {
    case 'Super Admin':
      roleModule = await import('../roles/superAdmin.js')
      break
    case 'Admin':
      roleModule = await import('../roles/admin.js')
      break
    case 'User':
      roleModule = await import('../roles/user.js')
      break
    default:
      console.error('Unknown role:', userData.role)
      return
  }
}

export { loadRoleBasedFeatures }
