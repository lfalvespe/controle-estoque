const User = require('../models/User')

const toStoredImageValue = (file) => {
    if (!file) return ''
    if (file.filename) return file.filename
    if (file.buffer && file.mimetype) {
        return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
    }
    return ''
}

class UserController {
        // Atualizar apenas a foto de perfil do próprio usuário
        async postEditOwnProfile(req, res) {
            try {
                let updateData = {}
                if (req.file) {
                    updateData.profileImage = toStoredImageValue(req.file)
                }
                if (Object.keys(updateData).length === 0) {
                    const user = await User.findById(req.session.user._id).lean();
                    return res.status(400).render('users/edit', {
                        user: { ...user, _id: user._id.toString() },
                        message: 'Selecione uma foto para atualizar.',
                        currentUserId: req.session.user._id.toString()
                    })
                }
                const user = await User.findByIdAndUpdate(
                    req.session.user._id,
                    updateData,
                    { new: true, runValidators: true }
                )
                if (user && req.session.user) {
                    req.session.user.profileImage = user.profileImage
                }
                res.redirect('/users/profile')
            } catch (error) {
                console.error(error)
                res.status(500).render('error', {
                    message: 'Erro ao atualizar foto de perfil'
                })
            }
        }
    // Exibir formulário de editar o próprio perfil
    async getEditOwnProfile(req, res) {
        try {
            const user = await User.findById(req.session.user._id).lean()
            if (!user) {
                return res.status(404).render('error', {
                    message: 'Usuário não encontrado'
                })
            }
            // Passa o id do usuário logado para o template, ambos como string
            res.render('users/edit', { user: { ...user, _id: user._id.toString() }, currentUserId: req.session.user._id.toString() })
        } catch (error) {
            console.error(error)
            res.status(500).render('error', {
                message: 'Erro ao buscar usuário'
            })
        }
    }
    // Exibir página de perfil do usuário logado
    async getProfile(req, res) {
        try {
            const user = await User.findById(req.session.user._id).lean()
            if (!user) {
                return res.status(404).render('error', { message: 'Usuário não encontrado' })
            }
            res.render('users/profile', { user, currentUserId: req.session.user._id })
        } catch (error) {
            console.error(error)
            res.status(500).render('error', { message: 'Erro ao carregar perfil' })
        }
    }
    // Listar todos os usuários (admin)
    async getUsers(req, res) {
        try {
            const users = await User.find().select('-password').lean()
            const created = req.query.created === 'true'
            const updated = req.query.updated === 'true'
            const deleted = req.query.deleted === 'true'
            const error = req.query.error || null
            
            console.log('Users encontrados:', users.length)
            res.render('users/list', { users, created, updated, deleted, error })
        } catch (error) {
            console.error(error)
            res.status(500).render('error', {
                message: 'Erro ao listar usuários'
            })
        }
    }

    // Exibir formulário de criar usuário (admin)
    async getCreateUser(req, res) {
        res.render('users/create')
    }

    // Criar novo usuário (admin)
    async postCreateUser(req, res) {
        try {
            const { name, email, password, passwordConfirm, role } = req.body
            let profileImage = ''
            if (req.file) {
                profileImage = toStoredImageValue(req.file)
            }

            // Validações
            if (!name || !email || !password || !passwordConfirm) {
                return res.status(400).render('users/create', {
                    message: 'Por favor forneça todos os dados'
                })
            }

            if (password !== passwordConfirm) {
                return res.status(400).render('users/create', {
                    message: 'As senhas não coincidem'
                })
            }

            // Verificar se email existe
            const user = await User.findOne({ email })
            if (user) {
                return res.status(400).render('users/create', {
                    message: 'Este email já está registrado'
                })
            }

            // Criar usuário
            await User.create({
                name,
                email,
                password,
                role: role || 'user',
                profileImage
            })

            res.status(201).redirect('/users?created=true')
        } catch (error) {
            console.error(error)
            res.status(500).render('users/create', {
                message: 'Erro ao criar usuário'
            })
        }
    }

    // Exibir formulário de editar usuário (admin)
    async getEditUser(req, res) {
        try {
            const user = await User.findById(req.params.id).lean()
            const passwordUpdated = req.query.passwordUpdated === 'true'

            if (!user) {
                return res.status(404).render('error', {
                    message: 'Usuário não encontrado'
                })
            }

            res.render('users/edit', {
                targetUser: user,
                passwordUpdated,
                currentUserId: req.session.user._id.toString()
            })
        } catch (error) {
            console.error(error)
            res.status(500).render('error', {
                message: 'Erro ao buscar usuário'
            })
        }
    }

    // Exibir formulário de alteração de senha de usuário padrão (admin)
    async getAdminChangeUserPassword(req, res) {
        try {
            const user = await User.findById(req.params.id).select('name email role').lean()

            if (!user) {
                return res.status(404).render('error', {
                    message: 'Usuário não encontrado'
                })
            }

            if (user.role !== 'user') {
                return res.status(400).render('error', {
                    message: 'Esta ação é permitida apenas para usuários padrão'
                })
            }

            res.render('users/change-password', { targetUser: user })
        } catch (error) {
            console.error(error)
            res.status(500).render('error', {
                message: 'Erro ao carregar formulário de alteração de senha'
            })
        }
    }

    // Alterar senha de usuário padrão (admin)
    async postAdminChangeUserPassword(req, res) {
        try {
            const { newPassword, passwordConfirm } = req.body
            const user = await User.findById(req.params.id).select('+password')

            if (!user) {
                return res.status(404).render('error', {
                    message: 'Usuário não encontrado'
                })
            }

            if (user.role !== 'user') {
                return res.status(400).render('error', {
                    message: 'Esta ação é permitida apenas para usuários padrão'
                })
            }

            if (!newPassword || !passwordConfirm) {
                return res.status(400).render('users/change-password', {
                    targetUser: { _id: user._id.toString(), name: user.name, email: user.email, role: user.role },
                    message: 'Por favor informe e confirme a nova senha'
                })
            }

            if (newPassword.length < 6) {
                return res.status(400).render('users/change-password', {
                    targetUser: { _id: user._id.toString(), name: user.name, email: user.email, role: user.role },
                    message: 'A nova senha deve ter no mínimo 6 caracteres'
                })
            }

            if (newPassword !== passwordConfirm) {
                return res.status(400).render('users/change-password', {
                    targetUser: { _id: user._id.toString(), name: user.name, email: user.email, role: user.role },
                    message: 'As senhas não coincidem'
                })
            }

            user.password = newPassword
            await user.save()

            res.redirect(`/users/${user._id}/edit?passwordUpdated=true`)
        } catch (error) {
            console.error(error)
            res.status(500).render('error', {
                message: 'Erro ao alterar senha do usuário'
            })
        }
    }

    // Atualizar usuário (admin)
    async postEditUser(req, res) {
        try {
            const { name, email, role } = req.body
            const userId = req.params.id
            let updateData = { name, email, role }
            if (req.file) {
                updateData.profileImage = toStoredImageValue(req.file)
            }

            if (!name || !email) {
                return res.status(400).render('users/edit', {
                    message: 'Por favor forneça todos os dados'
                })
            }

            // Verificar se o email já está em uso por outro usuário
            const existingUser = await User.findOne({
                email,
                _id: { $ne: userId }
            })

            if (existingUser) {
                const user = await User.findById(userId)
                return res.status(400).render('users/edit', {
                    targetUser: user,
                    currentUserId: req.session.user._id.toString(),
                    message: 'Este email já está em uso'
                })
            }

            // Atualizar usuário
            const user = await User.findByIdAndUpdate(
                userId,
                updateData,
                { new: true, runValidators: true }
            )

            // Se o usuário editado é o da sessão, atualize a foto na sessão
            if (req.session.user && req.session.user._id == userId) {
                if (updateData.profileImage) {
                    req.session.user.profileImage = updateData.profileImage;
                }
                req.session.user.name = name;
                req.session.user.email = email;
                req.session.user.role = role;
            }

            res.redirect('/users?updated=true')
        } catch (error) {
            console.error(error)
            res.status(500).render('error', {
                message: 'Erro ao atualizar usuário'
            })
        }
    }

    // Deletar usuário (admin)
    async deleteUser(req, res) {
        try {
            // Não permitir deletar a si mesmo
            if (req.session.user.id === req.params.id) {
                return res.redirect('/users?error=Você não pode deletar sua própria conta')
            }

            await User.findByIdAndDelete(req.params.id)
            res.redirect('/users?deleted=true')
        } catch (error) {
            console.error(error)
            res.status(500).render('error', {
                message: 'Erro ao deletar usuário'
            })
        }
    }
}

module.exports = new UserController()
