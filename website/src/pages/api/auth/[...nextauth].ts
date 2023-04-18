import { notifyError } from '@app/utils/sentry'

import { NextApiHandler } from 'next'
import NextAuth, { NextAuthOptions } from 'next-auth'
import type { Adapter } from 'next-auth/adapters'
import CredentialsProvider from 'next-auth/providers/credentials'
import EmailProvider from 'next-auth/providers/email'
import GoogleProvider from 'next-auth/providers/google'
import type { Prisma, PrismaClient, User } from 'db'
import { prisma } from 'db'
import cuid from 'cuid'
import { JWT } from 'next-auth/jwt'
import { env } from '@app/env'
import { AppError, KnownError } from '@app/utils/errors'
import { Provider } from 'jotai'

const adapter = PrismaAdapter(prisma)

const useSecureCookies = env.NEXT_PUBLIC_ENV !== 'development'

export const options: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: env.GOOGLE_ID!,
            clientSecret: env.GOOGLE_SECRET!,
        }),
        // EmailProvider({
        //     server: env.EMAIL_SERVER,
        //     from: 'Tommy from Salespack <tommy@salespack.io>',
        //     // limit emails to max per hour to prevent abuse
        //     generateVerificationToken: limitMaxPerHour({
        //         maxPerHour: 50,
        //         fn: () => cuid(),
        //     }),
        // }),
        env.NEXT_PUBLIC_ENV !== 'production' &&
            CredentialsProvider({
                id: 'test-provider',
                name: 'test-provider',
                credentials: {
                    email: { type: 'text' },
                    name: { type: 'text' },
                },

                authorize: async (credentials) => {
                    console.log('logging in with test provider', credentials)
                    const { email, name } = credentials
                    if (!email) {
                        throw new KnownError(
                            'Email is required for test provider',
                        )
                    }

                    let user = await adapter.getUserByEmail(email)

                    if (!user) {
                        if (!name) {
                            throw new KnownError(
                                'User does not exist, name is require',
                            )
                        }
                        user = await adapter.createUser({
                            name,
                            email,
                            emailVerified: new Date(),
                        })
                    }
                    if (!user) {
                        throw new AppError('cannot create test user?')
                    }

                    return user
                },
            }),
    ].filter(Boolean),
    adapter: adapter as any,

    logger: {
        error(code, metadata) {
            console.error(code, metadata)
            const message =
                metadata?.['error']?.message || metadata?.message || ''
            notifyError(code + ' ' + message, 'nextAuth')
            // console.error({ ...metadata?.['error'] })
        },
        warn(code) {
            console.warn(code)
        },
        // debug(code, metadata) {
        //     console.debug(code, metadata)
        // },
    },

    jwt: {
        secret: env.SECRET,
    },
    session: {
        strategy: 'jwt',
    },
    secret: env.SECRET,
    cookies: {
        sessionToken: {
            name: `${
                useSecureCookies ? '__Secure-' : ''
            }next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                // domain: '.solutions-subdomain-auth.vercel.sh',
                secure: useSecureCookies,
            },
        },
    },
    callbacks: {
        async jwt({ token, account, isNewUser, user, profile }) {
            try {
                // console.log(JSON.stringify({ account, profile }, null, 2))
                if (user) {
                    token.userId = user.id
                }

                if (isNewUser) {
                    token.isNewUser = true
                }

                return token
            } catch (e) {
                await notifyError(e, 'error in jwt callback')
                throw e
            }
        },

        async session({ session, user, token }) {
            session.user.id = token.userId
            session.jwt = token

            return session
        },
    },
}

const authHandler: NextApiHandler = (req, res) => NextAuth(req, res, options)

export default authHandler

export function PrismaAdapter(prisma: PrismaClient): Partial<Adapter> {
    return {
        async createUser(data) {
            let user = await prisma.user.create({ data })
            // TODO create default org
            return user
            // const defaultOrgName = getDefaultOrgNameFromUser(data)
            // console.info(`createUser`)

            // const row = await db.transaction().execute(async (trx) => {
            //     const orgId = cuid()
            //     await trx
            //         .insertInto('Org')
            //         .values({ name: defaultOrgName, id: orgId })
            //         .executeTakeFirst()
            //     const row: SqlUser = {
            //         ...data,
            //         id: cuid(),
            //         emailVerified: null,
            //         defaultOrgId: orgId,
            //     }
            //     await trx.insertInto('User').values(row).executeTakeFirst()

            //     await trx
            //         .insertInto('OrgsUsers')
            //         .values({ orgId, userId: row.id, role: 'admin' })
            //         .executeTakeFirst()
            //     return row
            // })
            // return row as any
        },

        getUser(id) {
            return prisma.user.findUnique({ where: { id } })
        },
        getUserByEmail(email) {
            return prisma.user.findUnique({ where: { email } })
        },
        async getUserByAccount(provider_providerAccountId) {
            const account = await prisma.account.findUnique({
                where: { provider_providerAccountId },
                select: { user: true },
            })
            return account?.user ?? null
        },
        updateUser(data) {
            return prisma.user.update({ where: { id: data.id }, data })
        },
        deleteUser(id) {
            return prisma.user.delete({ where: { id } })
        },
        async linkAccount(data) {
            // console.log('account', JSON.stringify(data, null, 2))
            const res = (await prisma.account.create({ data })) as any
            return res
        },
        unlinkAccount(provider_providerAccountId) {
            return prisma.account.delete({
                where: { provider_providerAccountId },
            }) as any
        },
        // async getSessionAndUser(sessionToken) {
        //     const userAndSession = await prisma.session.findUnique({
        //         where: { sessionToken },
        //         include: { user: true },
        //     })
        //     if (!userAndSession) return null
        //     const { user, ...session } = userAndSession
        //     return { user, session }
        // },
        // createSession: (data) => prisma.session.create({ data }),
        // updateSession: (data) =>
        //     prisma.session.update({
        //         data,
        //         where: { sessionToken: data.sessionToken },
        //     }),
        // deleteSession: (sessionToken) =>
        //     prisma.session.delete({ where: { sessionToken } }),
        createVerificationToken(data) {
            return prisma.verificationToken.create({ data })
        },
        async useVerificationToken(identifier_token) {
            try {
                return await prisma.verificationToken.delete({
                    where: { identifier_token },
                })
            } catch (error) {
                // If token already used/deleted, just return null
                // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
                if (
                    (error as Prisma.PrismaClientKnownRequestError).code ===
                    'P2025'
                )
                    return null
                throw error
            }
        },
    }
}
