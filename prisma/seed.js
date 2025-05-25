const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Delete existing data first
  await prisma.message.deleteMany()
  await prisma.reply.deleteMany()
  await prisma.topic.deleteMany()
  await prisma.user.deleteMany()
  await prisma.category.deleteMany()

  console.log('Cleared existing data')

  // Create categories
  const categories = await prisma.category.createMany({
    data: [
      { name: 'Teknoloji' },
      { name: 'Kariyer' },
      { name: 'Frontend' },
      { name: 'AI/ML' },
      { name: 'İş Hayatı' },
      { name: 'Genel' }
    ]
  })

  console.log('Categories created:', categories.count)

  // Get created categories
  const createdCategories = await prisma.category.findMany()
  console.log('Created categories:', createdCategories.map(c => c.name))

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@forum.com',
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    }
  })

  console.log('Admin user created:', admin.username)

  // Create sample user
  const userPassword = await bcrypt.hash('user123', 12)
  
  const sampleUser = await prisma.user.create({
    data: {
      email: 'user@forum.com',
      username: 'kullanici',
      password: userPassword,
      role: 'user'
    }
  })

  console.log('Sample user created:', sampleUser.username)

  // Create some sample topics
  const teknoloji = createdCategories.find(c => c.name === 'Teknoloji')
  const frontend = createdCategories.find(c => c.name === 'Frontend')
  const aiml = createdCategories.find(c => c.name === 'AI/ML')

  const topics = await prisma.topic.createMany({
    data: [
      {
        title: 'Web Geliştirme için En İyi Araçlar',
        content: 'Modern web geliştirme sürecinde hangi araçları kullanıyorsunuz? VS Code, Figma, GitHub gibi popüler araçlar hakkında deneyimlerinizi paylaşalım...',
        categoryId: teknoloji.id,
        authorId: admin.id,
        views: 234,
        likes: 8
      },
      {
        title: 'React vs Vue.js Karşılaştırması',
        content: 'Yeni bir proje başlayacağım ve React ile Vue.js arasında kararsız kaldım. Hangi framework daha avantajlı sizce?',
        categoryId: frontend.id,
        authorId: sampleUser.id,
        views: 678,
        likes: 18
      },
      {
        title: 'Yapay Zeka ve Gelecek',
        content: 'ChatGPT ve benzeri yapay zeka araçlarının hayatımıza etkisi hakkında ne düşünüyorsunuz? Gelecekte neler değişecek?',
        categoryId: aiml.id,
        authorId: admin.id,
        views: 892,
        likes: 25
      }
    ]
  })

  console.log('Sample topics created:', topics.count)
  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })