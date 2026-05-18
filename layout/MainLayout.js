// MainLayout.js
export default {
    template: `
        <div class="min-h-screen bg-white" style="font-family: 'Inter', sans-serif">
            <navbar-component></navbar-component>
            <main>
                <router-view></router-view>
            </main>
            <footer-component></footer-component>
        </div>
    `
};