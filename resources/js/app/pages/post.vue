<template>

    <!-- crud -->
    <div class="crud">

        <!-- crud header part === search filter and new data to show modal -->
        <div class="crud-header">
            <input type="text" name="keyword" v-model="searchData" class="search" placeholder="Search Here" required autocomplete="off" />
            <button type="button" class="btn-theme" @click="openManageModal(null)"> New </button>
        </div>

        <!-- crud body part === loading with table data -->
        <div class="crud-body">

            <template v-if="this.tableData.length === 0 && !listLoading">

                <!-- No data founded -->
                <div class="no-data-founded">
                    <div class="title">
                        No Data Founded
                    </div>
                    <div class="sub-title">
                        Click "New" to add new data
                    </div>
                </div>

            </template>

            <template v-if="this.tableData.length > 0 && !listLoading">

                <div class="have-data">

                    <!-- table data -->
                    <div class="crud-content" v-for="each in filteredData">

                        <!-- crud body part === title -->
                        <div class="title">
                            <div class="text-truncate-2">
                                {{each.title}}
                            </div>
                        </div>

                        <!-- crud body part === body -->
                        <div class="body">
                            <div class="text-truncate-3">
                                {{each.body}}
                            </div>
                        </div>

                        <!-- crud body part === button group for end and delete modal open -->
                        <div class="button-group">
                            <button type="button" class="btn btn-edit" @click="openManageModal(each.id)">
                                Edit
                            </button>
                            <button type="button" class="btn btn-delete" @click="openDeleteModal(each.id)">
                                Delete
                            </button>
                        </div>

                    </div>

                </div>

            </template>

            <template v-if="listLoading">

                <!-- data loading -->
                <div class="data-loading">

                    <div class="spinner"></div>

                </div>

            </template>

        </div>

        <!-- crud footer part === pagination -->
        <div class="crud-footer" v-if="filteredData.length > 0">

            <!-- pagination previous -->
            <button type="button" class="next" @click="prevPage" :disabled="currentPage === 1">
                Previous
            </button>

            <!-- pagination page activities -->
            <div class="count-number">
                Page {{ currentPage }} out of {{ totalPages }}
            </div>

            <!-- pagination next -->
            <button type="button" class="previous" @click="nextPage" :disabled="currentPage === totalPages">
                Next
            </button>
        </div>

        <!-- manage modal -->
        <div class="modal" id="manageModal" style="display: none">
            <form @submit.prevent="manageApi()" class="modal-content">
                <div class="modal-header">
                    <div class="modal-header-title">
                        <span v-if="this.formData.id === undefined">
                            Create
                        </span>
                        <span v-if="this.formData.id !== undefined">
                            Edit
                        </span>
                        Post
                    </div>
                    <button type="button" class="modal-close" @click="closeManageModal()">

                    </button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="title" class="form-label"> Title </label>
                        <input id="title" type="text" name="title" class="form-control" v-model="formData.title" placeholder="Enter Your Name" required autocomplete="off" />
                    </div>
                    <div class="mb-3">
                        <label for="body" class="form-label"> Body </label>
                        <textarea id="body" name="body" class="form-textarea" v-model="formData.body" placeholder="Enter Your body text" cols="30" rows="5" required autocomplete="off"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-cancel" @click="closeManageModal()">
                        Cancel
                    </button>
                    <button type="submit" class="btn btn-theme">
                    <span v-if="this.formData.id === undefined">
                        Save
                    </span>
                        <span v-if="this.formData.id !== undefined">
                        Update
                    </span>
                    </button>
                </div>
            </form>
        </div>

        <!-- delete modal -->
        <div class="modal" id="deleteModal" style="display: none">
            <form @submit.prevent="deleteApi()" class="modal-content">
                <div class="modal-body delete-modal">
                    <div class="text-center">
                        <img :src="'/assets/svg/delete.svg'" width="120" height="120" alt="delete" />
                    </div>
                    <div class="text-center delete-text">
                        Are you Sure?
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-cancel" @click="closeDeleteModal()">
                        Cancel
                    </button>
                    <button type="submit" class="btn btn-delete">
                        Confirm
                    </button>
                </div>
            </form>
        </div>

    </div>

</template>

<script>

import axios from "axios";

export default {

    // data properties
    data() {
        return {

            // loading
            manageLoading: false,
            listLoading: false,
            singleLoading: false,

            // form data
            formData: {
                title: '',
                body: '',
            },

            // table data
            tableData: [],

            // delete data basis on id
            deleteData: { id: '' },

            // search data of table data
            searchData: '',

            // pagination of table data
            currentPage: 1,
            limit: 8,

        };
    },

    // mounted properties
    mounted() {

        // list api
        this.ReadApi();

    },

    // computed properties
    computed: {

        // filter data as instructed for keyword and pagination of table data
        filteredData() {

            // pagination start and end part
            const start = (this.currentPage - 1) * this.limit;
            const end = start + this.limit;

            // search data query initialize of lowercase
            const query = this.searchData ? this.searchData.toLowerCase() : '';

            // filter title and body to lowercase as case-sensitive in array separate
            const filtered = this.tableData.filter(post => {
                const title = post.title || '';
                const body = post.body || '';
                return title.toLowerCase().includes(query) || body.toLowerCase().includes(query);
            });

            // return filter as show pagination
            return filtered.slice(start, end);

        },

        // pagination of total pages
        totalPages() {
            const query = this.searchData ? this.searchData.toLowerCase() : '';
            return Math.ceil(
                this.tableData.filter(post => {
                    const title = post.title || '';
                    const body = post.body || '';
                    return title.toLowerCase().includes(query) || body.toLowerCase().includes(query);
                }).length / this.limit
            );
        },

    },

    // methods properties
    methods: {

        // Function of manage api
        manageApi() {
            this.manageLoading = true;
            if (this.formData.id) {
                this.updateApi();
            } else {
                this.createApi();
            }
        },

        // Function of create api
        createApi() {
            axios.post('https://jsonplaceholder.typicode.com/posts', this.formData, {
                headers: { 'Content-Type': 'application/json; charset=utf-8' } } ).then(response => {
                this.tableData.unshift(response.data);
                this.closeManageModal();
            }).catch(error => {
                console.error(error);
            }).finally(() => {
                this.manageLoading = false;
            });
        },

        // Function of update api
        updateApi() {
            axios.put(`https://jsonplaceholder.typicode.com/posts/${this.formData.id}`, this.formData, {
                headers: { 'Content-Type': 'application/json; charset=utf-8' } }).then(response => {
                const index = this.tableData.findIndex(post => post.id === this.formData.id);
                if (index !== -1) { this.tableData.splice(index, 1, response.data); }
                this.closeManageModal();
            }).catch(error => {
                console.error(error);
            }).finally(() => {
                this.manageLoading = false;
            });
        },

        // Function of delete api
        deleteApi() {
            axios.delete(`https://jsonplaceholder.typicode.com/posts/${this.deleteData.id}`, {
                headers: { 'Content-Type': 'application/json; charset=utf-8' } }).then(() => {
                this.tableData = this.tableData.filter(post => post.id !== this.deleteData.id);
                this.closeDeleteModal();
            }).catch(error => {
                console.error(error);
            });
        },

        // Function of read or list api
        ReadApi() {
            this.listLoading = true;
            axios.get('https://jsonplaceholder.typicode.com/posts', {
                headers: { 'Content-Type': 'application/json; charset=utf-8' } }).then(response => {
                this.tableData = Array.isArray(response.data) ? response.data : [];
            }).catch(error => {
                console.error(error);
            }).finally(() => {
                this.listLoading = false;
            });
        },

        // Function of next page following list api
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            }
        },

        // Function of previous page following list api
        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
            }
        },

        // Function of single api
        SingleApi(id) {
            this.singleLoading = true;
            axios.get(`https://jsonplaceholder.typicode.com/posts/${id}`, { headers: { 'Content-Type': 'application/json; charset=utf-8' } }).then(response => {
                this.formData = response.data;
            }).catch(error => {
                console.error(error);
            }).finally(() => {
                this.singleLoading = false;
            });
        },

        // Function of open manage modal
        openManageModal(id = null) {
            if (id === null) {
                this.formData = { title: '', body: '' }
            } else {
                const existingData = this.tableData.find(post => post.id === id);
                if (existingData) {
                    this.formData = { ...existingData };
                } else {
                    this.SingleApi(id);
                }
            }
            document.querySelector('#manageModal').style.display = 'flex';
        },

        // Function of close manage modal
        closeManageModal() {
            document.querySelector('#manageModal').style.display = 'none';
        },

        // Function of open delete modal
        openDeleteModal(id) {
            if(id) { this.deleteData.id = id }
            document.querySelector('#deleteModal').style.display = 'flex';
        },

        // Function of close delete modal
        closeDeleteModal() {
            document.querySelector('#deleteModal').style.display = 'none';
        },

    },

};
</script>
