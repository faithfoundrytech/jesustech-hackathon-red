"use client";

import { useState } from "react";
import Link from "next/link";
import SermonGameCard from "../components/SermonGameCard";
import MetricsCard from "../components/MetricsCard";
import TeamMemberCard from "../components/TeamMemberCard";
import ShopItemCard from "../components/ShopItemCard";

export default function PastorDashboard() {
  // Mock data for demonstration
  const mockData = {
    metrics: {
      usersInChurch: 128,
      gamesPlayed: 356,
      totalGames: 12,
      shopItems: 45
    },
    sermonGames: [
      { id: 1, title: "The Prodigal Son", players: 42, avgScore: 78, createdAt: "2024-10-15" },
      { id: 2, title: "Noah's Ark", players: 38, avgScore: 82, createdAt: "2024-10-10" },
      { id: 3, title: "David & Goliath", players: 56, avgScore: 75, createdAt: "2024-10-05" }
    ],
    topScorers: [
      { id: 1, name: "John D.", score: 98, game: "The Prodigal Son" },
      { id: 2, name: "Mary S.", score: 96, game: "Noah's Ark" },
      { id: 3, name: "Peter L.", score: 94, game: "David & Goliath" }
    ],
    teamMembers: [
      { id: 1, name: "James Wilson", role: "Church Administrator", email: "james@church.org" },
      { id: 2, name: "Sarah Johnson", role: "Shop Manager", email: "sarah@church.org" },
      { id: 3, name: "Michael Brown", role: "Youth Pastor", email: "michael@church.org" }
    ],
    shopItems: [
      { 
        id: 1, 
        name: "Bible Study Guide", 
        type: "product", 
        price: 15.99, 
        description: "Comprehensive study guide for sermon series", 
        stock: 25 
      },
      { 
        id: 2, 
        name: "Counseling Session", 
        type: "service", 
        price: 0, 
        description: "Free counseling sessions with Pastor" 
      },
      { 
        id: 3, 
        name: "Youth Camp Scholarship", 
        type: "donation", 
        donor: "Smith Family", 
        verified: true, 
        description: "Scholarship for summer youth camp" 
      },
      { 
        id: 4, 
        name: "Prayer Journal", 
        type: "product", 
        price: 8.99, 
        description: "Daily prayer journal with scripture", 
        stock: 15 
      },
      { 
        id: 5, 
        name: "Musical Instrument", 
        type: "donation", 
        donor: "Anonymous", 
        verified: false, 
        description: "Electric keyboard for worship team" 
      }
    ]
  };

  const [activeTab, setActiveTab] = useState("dashboard");
  const [shopCategory, setShopCategory] = useState("all");

  const handleEditTeamMember = (id: number) => {
    console.log(`Editing team member with ID: ${id}`);
    // Implementation for editing team member
  };

  const handleRemoveTeamMember = (id: number) => {
    console.log(`Removing team member with ID: ${id}`);
    // Implementation for removing team member
  };

  const handleEditShopItem = (id: number) => {
    console.log(`Editing shop item with ID: ${id}`);
    // Implementation for editing shop item
  };

  const handleDeleteShopItem = (id: number) => {
    console.log(`Deleting shop item with ID: ${id}`);
    // Implementation for deleting shop item
  };

  const filteredShopItems = shopCategory === "all" 
    ? mockData.shopItems 
    : mockData.shopItems.filter(item => item.type === shopCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-700 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Pastor's Dashboard</h1>
          <div className="flex space-x-4">
            <Link href="/" className="px-4 py-2 rounded hover:bg-indigo-600">Home</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            New Sermon Game
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Manage Shop Items
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
            View Users
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <ul className="flex flex-wrap -mb-px">
            <li className="mr-2">
              <button
                className={`inline-block p-4 ${
                  activeTab === "dashboard"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("dashboard")}
              >
                Dashboard
              </button>
            </li>
            <li className="mr-2">
              <button
                className={`inline-block p-4 ${
                  activeTab === "sermonGames"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("sermonGames")}
              >
                Sermon Games
              </button>
            </li>
            <li className="mr-2">
              <button
                className={`inline-block p-4 ${
                  activeTab === "shop"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("shop")}
              >
                Shop Management
              </button>
            </li>
            <li className="mr-2">
              <button
                className={`inline-block p-4 ${
                  activeTab === "team"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("team")}
              >
                Team Members
              </button>
            </li>
          </ul>
        </div>

        {/* Dashboard Content */}
        {activeTab === "dashboard" && (
          <div>
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricsCard 
                title="Users in Church" 
                value={mockData.metrics.usersInChurch} 
                subtitle="Total registered users"
                percentage={12}
                isPositive={true}
              />
              <MetricsCard 
                title="Games Played" 
                value={mockData.metrics.gamesPlayed} 
                color="green"
                subtitle="Last 30 days"
                percentage={8}
                isPositive={true}
              />
              <MetricsCard 
                title="Total Games" 
                value={mockData.metrics.totalGames} 
                color="blue"
                subtitle="Available sermon games"
              />
              <MetricsCard 
                title="Shop Items" 
                value={mockData.metrics.shopItems} 
                color="purple"
                subtitle="Products & services"
              />
            </div>

            {/* Recent Sermon Games */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-xl font-semibold mb-4">Recent Sermon Games</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mockData.sermonGames.map((game) => (
                  <SermonGameCard
                    key={game.id}
                    id={game.id}
                    title={game.title}
                    players={game.players}
                    avgScore={game.avgScore}
                    createdAt={game.createdAt}
                  />
                ))}
              </div>
            </div>

            {/* Top Scorers */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Top Scorers</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockData.topScorers.map((player) => (
                      <tr key={player.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{player.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{player.game}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-green-600">{player.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Sermon Games Content */}
        {activeTab === "sermonGames" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">All Sermon Games</h2>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Create New Game
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockData.sermonGames.map((game) => (
                <SermonGameCard
                  key={game.id}
                  id={game.id}
                  title={game.title}
                  players={game.players}
                  avgScore={game.avgScore}
                  createdAt={game.createdAt}
                />
              ))}
            </div>
          </div>
        )}

        {/* Shop Management Content */}
        {activeTab === "shop" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Shop Management</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Add New Item
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex border-b">
                <button
                  className={`py-2 px-4 font-medium ${
                    shopCategory === "all" 
                      ? "border-b-2 border-indigo-600 text-indigo-600" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setShopCategory("all")}
                >
                  All Items
                </button>
                <button
                  className={`py-2 px-4 font-medium ${
                    shopCategory === "product" 
                      ? "border-b-2 border-indigo-600 text-indigo-600" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setShopCategory("product")}
                >
                  Products
                </button>
                <button
                  className={`py-2 px-4 font-medium ${
                    shopCategory === "service" 
                      ? "border-b-2 border-indigo-600 text-indigo-600" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setShopCategory("service")}
                >
                  Services
                </button>
                <button
                  className={`py-2 px-4 font-medium ${
                    shopCategory === "donation" 
                      ? "border-b-2 border-indigo-600 text-indigo-600" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setShopCategory("donation")}
                >
                  Donations
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredShopItems.map((item) => (
                <ShopItemCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  type={item.type as 'product' | 'service' | 'donation'}
                  price={item.price}
                  description={item.description}
                  stock={item.stock}
                  donor={item.donor}
                  verified={item.verified}
                  onEdit={handleEditShopItem}
                  onDelete={handleDeleteShopItem}
                />
              ))}
            </div>
          </div>
        )}

        {/* Team Members Content */}
        {activeTab === "team" && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Team Members</h2>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                Add Team Member
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockData.teamMembers.map((member) => (
                <TeamMemberCard
                  key={member.id}
                  id={member.id}
                  name={member.name}
                  role={member.role}
                  email={member.email}
                  onEdit={handleEditTeamMember}
                  onRemove={handleRemoveTeamMember}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 