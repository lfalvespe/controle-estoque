const User = require('../models/User')

class AuthController {
    // Exibir página de login
    async getLogin(req, res) {
        const redirect = req.query.redirect || '/'
        res.render('auth/login', { redirect })
    }

    // Fazer login
    async postLogin(req, res) {
        try {
            const { email, password } = req.body
            const redirect = req.body.redirect || '/'

            if (!email || !password) {
                return res.status(400).render('auth/login', {
                    message: 'Por favor forneça email e senha',
                    redirect
                })
            }

            // Buscar usuário e selecionar todos os campos necessários
            const user = await User.findOne({ email }).select('+password name email role profileImage')

            if (!user) {
                return res.status(400).render('auth/login', {
                    message: 'Email ou senha incorretos',
                    redirect
                })
            }

            // Verificar senha
            const isPasswordValid = await user.matchPassword(password)

            if (!isPasswordValid) {
                return res.status(400).render('auth/login', {
                    message: 'Email ou senha incorretos',
                    redirect
                })
            }

            // Salvar usuário na sessão
            req.session.user = {
                _id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage || ''
            }

            // Debug: mostrar o conteúdo da sessão após login
            console.log('Sessão após login:', req.session.user)

            res.redirect(redirect)
        } catch (error) {
            console.error(error)
            res.status(500).render('auth/login', {
                message: 'Erro ao fazer login'
            })
        }
    }

    // Logout
    async logout(req, res) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).send('Erro ao fazer logout')
            }
            res.redirect('/')
        })
    }

    // Exibir formulário de alterar senha
    async getChangePassword(req, res) {
        res.render('auth/change-password')
    }

    // Alterar senha
    async postChangePassword(req, res) {
        try {
            const { currentPassword, newPassword, passwordConfirm } = req.body

            // Validações
            if (!currentPassword || !newPassword || !passwordConfirm) {
                return res.status(400).render('auth/change-password', {
                    message: 'Por favor forneça todos os dados'
                })
            }

            if (newPassword !== passwordConfirm) {
                return res.status(400).render('auth/change-password', {
                    message: 'As senhas não coincidem'
                })
            }

            if (newPassword.length < 6) {
                return res.status(400).render('auth/change-password', {
                    message: 'A senha deve ter no mínimo 6 caracteres'
                })
            }

            // Buscar usuário atual
            const user = await User.findById(req.session.user._id).select('+password')

            if (!user) {
                return res.status(404).render('error', {
                    message: 'Usuário não encontrado'
                })
            }

            // Verificar se a senha atual está correta
            const isPasswordValid = await user.matchPassword(currentPassword)

            if (!isPasswordValid) {
                return res.status(400).render('auth/change-password', {
                    message: 'Senha atual incorreta'
                })
            }

            // Atualizar senha
            user.password = newPassword
            await user.save()

            res.status(200).render('auth/change-password', {
                message_success: 'Senha alterada com sucesso!'
            })
        } catch (error) {
            console.error(error)
            res.status(500).render('auth/change-password', {
                message: 'Erro ao alterar senha'
            })
        }
    }
}

module.exports = new AuthController()
