<template>
    <div class="header">
        <input
            v-model="searchData"
            type="text"
            name="keyword"
            class="form-control"
            placeholder="Search Here"
            required
            autocomplete="off"
        />
    </div>

    <div class="card-grid" v-if="message === null && filteredData.length > 0">
        <div class="user-card" v-for="(each, index) in filteredData" :key="index">
            <div class="user-info border">
                <div class="p-3">
                    <div class="mb-1"> Name </div>
                    <div> {{each?.name}} </div>
                </div>
                <div class="p-3">
                    <div class="mb-1"> Email </div>
                    <div> {{each?.email}} </div>
                </div>
                <div class="group-button">
                    <button type="button" class="btn btn-edit">
                        Edit
                    </button>
                    <button type="button" class="btn btn-delete" @click="deleteData(each.id)">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div class="network-error" v-if="message !== null">
        {{message}}
    </div>

    <!-- Pagination Controls -->
    <div v-if="filteredData.length > 0" class="pagination">
        <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
    </div>
</template>

<script>
import axios from "axios";
import { apiUrl, applicationJson } from "../services/api";

export default {
    data() {
        return {
            loading: false,
            deleteLoading: false,
            userData: [],
            searchData: "",
            currentPage: 1,
            limit: 5,
            message: null,
        };
    },
    mounted() {
        this.getList();
    },
    computed: {
        filteredData() {
            const query = this.searchData.toLowerCase();
            const filtered = this.userData.filter(user =>
                user.name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query)
            );
            const start = (this.currentPage - 1) * this.limit;
            const end = start + this.limit;
            return filtered.slice(start, end);
        },
        totalPages() {
            return Math.ceil(
                this.userData.filter(user =>
                    user.name.toLowerCase().includes(this.searchData.toLowerCase()) ||
                    user.email.toLowerCase().includes(this.searchData.toLowerCase())
                ).length / this.limit
            );
        }
    },
    methods: {
        getList() {
            this.loading = true;
            axios.get(apiUrl.usersApi, { headers: applicationJson }).then((response) => {
                console.log(response)
                this.userData = response.data;
            }).catch((error) => {
                console.log(error)
                this.message = error.message
            }).finally(() => {
                this.loading = false;
            });
        },
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            }
        },
        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
            }
        },
        deleteData(data) {
            this.deleteLoading = true;
            axios.get(apiUrl.userDeleteApi, {params: data}, { headers: applicationJson }).then((response) => {
                console.log(response)
            }).catch((error) => {
                console.log(error)
            }).finally(() => {
                this.deleteLoading = false;
            });
        },
    },
};
</script>
