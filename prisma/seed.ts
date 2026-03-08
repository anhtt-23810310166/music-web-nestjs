import { PrismaClient, Topic, Singer, Song } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...\n');

  // ─── 1. Create Admin User ────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@music.com' },
    update: {},
    create: {
      email: 'admin@music.com',
      password: adminPassword,
      fullName: 'Admin Music',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log(`Admin user: ${admin.email}`);

  // Create a normal user
  const userPassword = await bcrypt.hash('User@123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@music.com' },
    update: {},
    create: {
      email: 'user@music.com',
      password: userPassword,
      fullName: 'Nguyen Van A',
      role: 'USER',
      status: 'ACTIVE',
    },
  });
  console.log(`Normal user: ${user.email}`);

  // ─── 2. Create Topics ────────────────────────────────────────
  const topicsData = [
    {
      title: 'Pop',
      slug: 'pop',
      description: 'Nhạc Pop quốc tế và Việt Nam',
      position: 1,
    },
    {
      title: 'R&B',
      slug: 'rnb',
      description: 'Rhythm and Blues',
      position: 2,
    },
    {
      title: 'Hip-Hop',
      slug: 'hip-hop',
      description: 'Nhạc Rap và Hip-Hop',
      position: 3,
    },
    {
      title: 'Ballad',
      slug: 'ballad',
      description: 'Nhạc trữ tình, ballad',
      position: 4,
    },
    {
      title: 'EDM',
      slug: 'edm',
      description: 'Electronic Dance Music',
      position: 5,
    },
    {
      title: 'Rock',
      slug: 'rock',
      description: 'Nhạc Rock các loại',
      position: 6,
    },
    {
      title: 'Indie',
      slug: 'indie',
      description: 'Nhạc Indie / Alternative',
      position: 7,
    },
    {
      title: 'Lofi',
      slug: 'lofi',
      description: 'Lo-fi chill beats',
      position: 8,
    },
  ];

  const topics: Record<string, Topic> = {};
  for (const t of topicsData) {
    topics[t.slug] = await prisma.topic.upsert({
      where: { slug: t.slug },
      update: {},
      create: t,
    });
  }
  console.log(`${Object.keys(topics).length} topics created`);

  // ─── 3. Create Singers ───────────────────────────────────────
  const singersData = [
    {
      fullName: 'Sơn Tùng M-TP',
    },
    {
      fullName: 'Đen Vâu',
    },
    {
      fullName: 'Hoàng Thùy Linh',
    },
    {
      fullName: 'Jack',
    },
    {
      fullName: 'Bích Phương',
    },
    {
      fullName: 'Vũ.',
    },
    {
      fullName: 'Hương Ly',
    },
    {
      fullName: 'Tlinh',
    },
  ];

  // Delete existing singers to avoid duplicates on re-seed
  await prisma.singer.deleteMany({});
  const singers: Singer[] = [];
  for (const s of singersData) {
    const singer = await prisma.singer.create({ data: s });
    singers.push(singer);
  }
  console.log(`${singers.length} singers created`);

  // ─── 4. Create Songs ─────────────────────────────────────────
  const songsData = [
    {
      title: 'Hãy Trao Cho Anh',
      audio: 'https://example.com/audio/hay-trao-cho-anh.mp3',
      slug: 'hay-trao-cho-anh',
      description: 'Hit quốc tế đình đám của Sơn Tùng M-TP ft. Snoop Dogg',
      singerId: singers[0].id,
      topicId: topics['pop'].id,
      listenCount: 250000,
      duration: 254,
    },
    {
      title: 'Chạy Ngay Đi',
      audio: 'https://example.com/audio/chay-ngay-di.mp3',
      slug: 'chay-ngay-di',
      description: 'MV đình đám với hàng triệu lượt xem',
      singerId: singers[0].id,
      topicId: topics['pop'].id,
      listenCount: 180000,
      duration: 312,
    },
    {
      title: 'Mang Tiền Về Cho Mẹ',
      audio: 'https://example.com/audio/mang-tien-ve-cho-me.mp3',
      slug: 'mang-tien-ve-cho-me',
      description: 'Bản Hit triệu view của Đen Vâu',
      singerId: singers[1].id,
      topicId: topics['hip-hop'].id,
      listenCount: 320000,
      duration: 273,
    },
    {
      title: 'Đi Về Nhà',
      audio: 'https://example.com/audio/di-ve-nha.mp3',
      slug: 'di-ve-nha',
      description: 'Ca khúc mùa tết ý nghĩa',
      singerId: singers[1].id,
      topicId: topics['hip-hop'].id,
      listenCount: 150000,
      duration: 245,
    },
    {
      title: 'See Tình',
      audio: 'https://example.com/audio/see-tinh.mp3',
      slug: 'see-tinh',
      description: 'Viral hit toàn cầu của Hoàng Thùy Linh',
      singerId: singers[2].id,
      topicId: topics['pop'].id,
      listenCount: 500000,
      duration: 198,
    },
    {
      title: 'Hoa Hải Đường',
      audio: 'https://example.com/audio/hoa-hai-duong.mp3',
      slug: 'hoa-hai-duong',
      description: 'Ca khúc triệu view của Jack',
      singerId: singers[3].id,
      topicId: topics['ballad'].id,
      listenCount: 420000,
      duration: 286,
    },
    {
      title: 'Bùa Yêu',
      audio: 'https://example.com/audio/bua-yeu.mp3',
      slug: 'bua-yeu',
      description: 'Hit đồng quê cực kỳ viral',
      singerId: singers[4].id,
      topicId: topics['pop'].id,
      listenCount: 280000,
      duration: 234,
    },
    {
      title: 'Lạ Lùng',
      audio: 'https://example.com/audio/la-lung.mp3',
      slug: 'la-lung',
      description: 'Ca khúc Indie nổi bật của Vũ.',
      singerId: singers[5].id,
      topicId: topics['indie'].id,
      listenCount: 95000,
      duration: 267,
    },
    {
      title: 'Anh Nhà Ở Đâu Thế',
      audio: 'https://example.com/audio/anh-nha-o-dau-the.mp3',
      slug: 'anh-nha-o-dau-the',
      description: 'Cover triệu view',
      singerId: singers[6].id,
      topicId: topics['ballad'].id,
      listenCount: 120000,
      duration: 215,
    },
    {
      title: 'Ghệ Iu Dấu Ơi',
      audio: 'https://example.com/audio/ghe-iu-dau-oi.mp3',
      slug: 'ghe-iu-dau-oi',
      description: 'Hit R&B của Tlinh',
      singerId: singers[7].id,
      topicId: topics['rnb'].id,
      listenCount: 78000,
      duration: 201,
    },
    {
      title: 'Nước Mắt Em Lau Bằng Tình Yêu Mới',
      audio: 'https://example.com/audio/nuoc-mat-em.mp3',
      slug: 'nuoc-mat-em-lau-bang-tinh-yeu-moi',
      description: 'Ca khúc EDM cực hot',
      singerId: singers[2].id,
      topicId: topics['edm'].id,
      listenCount: 340000,
      duration: 243,
    },
    {
      title: 'Chúng Ta Của Hiện Tại',
      audio: 'https://example.com/audio/chung-ta-cua-hien-tai.mp3',
      slug: 'chung-ta-cua-hien-tai',
      description: 'MV comeback đình đám',
      singerId: singers[0].id,
      topicId: topics['pop'].id,
      listenCount: 450000,
      duration: 298,
    },
  ];

  // Clear and re-create songs
  await prisma.playlistSong.deleteMany({});
  await prisma.favoriteSong.deleteMany({});
  await prisma.song.deleteMany({});

  let songCount = 0;
  const createdSongs: Song[] = [];
  for (const song of songsData) {
    const created = await prisma.song.create({ data: song });
    createdSongs.push(created);
    songCount++;
  }
  console.log(`${songCount} songs created`);

  // ─── 5. Create a sample Playlist ─────────────────────────────
  await prisma.playlist.deleteMany({});
  const playlist = await prisma.playlist.create({
    data: {
      title: 'Top Hits Việt Nam 2024',
      description: 'Những bài hát Việt Nam hay nhất',
      isPublic: true,
      userId: user.id,
      songs: {
        create: createdSongs.slice(0, 5).map((s: Song, i: number) => ({
          songId: s.id,
          position: i + 1,
        })),
      },
    },
  });
  console.log(`Playlist "${playlist.title}" with 5 songs`);

  // ─── 6. Favorite some songs ──────────────────────────────────
  for (const song of createdSongs.slice(0, 3)) {
    await prisma.favoriteSong.create({
      data: { userId: user.id, songId: song.id },
    });
  }
  console.log(`3 favorite songs for user`);

  console.log('\nSeed completed successfully!');
  console.log('─────────────────────────────────────────');
  console.log('Admin login: admin@music.com / Admin@123');
  console.log('User login:  user@music.com / User@123');
  console.log('─────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
